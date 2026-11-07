// H.264/HEVC MP4 encoder for record.mjs on macOS, used when ffmpeg is not installed.
// AVFoundation with the hardware encoder; no third-party code. record.mjs compiles it on first use:
//   clang -fobjc-arc -O2 encode.m -framework AVFoundation -framework CoreMedia -framework CoreVideo -framework ImageIO -framework CoreGraphics -o encode
//
//   encode <out.mp4> <fps> --dir <frames/>   encode the sorted .jpg/.png files of a folder
//   encode <out.mp4> <fps> --stdin           frames on stdin, each as a 4-byte big-endian length and the image bytes
//   options: --hevc   --mbps <megabits per second> (default 40 for 1920x1080, scaled with the pixel count)
#import <AVFoundation/AVFoundation.h>
#import <CoreVideo/CoreVideo.h>
#import <ImageIO/ImageIO.h>
#include <unistd.h>

static void fail(NSString *s) { fprintf(stderr, "%s\n", s.UTF8String); exit(1); }

static BOOL readAll(uint8_t *p, size_t n) {
  while (n) { ssize_t k = read(0, p, n); if (k <= 0) return NO; p += k; n -= (size_t)k; }
  return YES;
}

static CGImageRef decode(NSData *d) {   // caller releases
  if (!d) return NULL;
  CGImageSourceRef src = CGImageSourceCreateWithData((__bridge CFDataRef)d, NULL);
  if (!src) return NULL;
  CGImageRef img = CGImageSourceCreateImageAtIndex(src, 0, NULL);
  CFRelease(src);
  return img;
}

int main(int argc, const char **argv) {
  @autoreleasepool {
    if (argc < 4) fail(@"usage: encode <out.mp4> <fps> --dir <frames> | --stdin [--hevc] [--mbps N]");
    NSURL *out = [NSURL fileURLWithPath:@(argv[1])];
    int32_t fps = atoi(argv[2]);
    BOOL hevc = NO; double mbps = 0; NSString *dir = nil; BOOL useStdin = NO;
    for (int i = 3; i < argc; i++) {
      if (!strcmp(argv[i], "--hevc")) hevc = YES;
      else if (!strcmp(argv[i], "--mbps") && i + 1 < argc) mbps = atof(argv[++i]);
      else if (!strcmp(argv[i], "--dir") && i + 1 < argc) dir = @(argv[++i]);
      else if (!strcmp(argv[i], "--stdin")) useStdin = YES;
    }
    if (fps <= 0 || (!dir && !useStdin)) fail(@"give a frame rate and --dir <frames> or --stdin");

    // Frames come one at a time from a folder or from a length-prefixed stream.
    NSArray<NSString *> *files = nil; __block NSUInteger fileIndex = 0;
    if (dir) {
      files = [[[NSFileManager.defaultManager contentsOfDirectoryAtPath:dir error:nil]
        filteredArrayUsingPredicate:[NSPredicate predicateWithFormat:@"self ENDSWITH '.jpg' OR self ENDSWITH '.png'"]]
        sortedArrayUsingSelector:@selector(compare:)];
    }
    NSData *(^next)(void) = ^NSData *{
      if (files) return fileIndex < files.count ? [NSData dataWithContentsOfFile:[dir stringByAppendingPathComponent:files[fileIndex++]]] : nil;
      uint8_t h[4];
      if (!readAll(h, 4)) return nil;
      size_t n = ((size_t)h[0] << 24) | ((size_t)h[1] << 16) | ((size_t)h[2] << 8) | h[3];
      NSMutableData *d = [NSMutableData dataWithLength:n];
      return readAll(d.mutableBytes, n) ? d : nil;
    };

    CGImageRef img = decode(next());
    if (!img) fail(@"no frames");
    size_t w = CGImageGetWidth(img), h = CGImageGetHeight(img);
    [NSFileManager.defaultManager removeItemAtURL:out error:nil];
    NSError *err = nil;
    AVAssetWriter *writer = [AVAssetWriter assetWriterWithURL:out fileType:AVFileTypeMPEG4 error:&err];
    if (!writer) fail([NSString stringWithFormat:@"cannot write %@: %@", out.path, err]);
    double bitrate = (mbps > 0 ? mbps : 40.0 * (double)(w * h) / (1920.0 * 1080.0)) * 1e6;
    NSMutableDictionary *comp = [@{AVVideoAverageBitRateKey: @(bitrate), AVVideoMaxKeyFrameIntervalKey: @(fps * 2),
                                   AVVideoExpectedSourceFrameRateKey: @(fps), AVVideoAllowFrameReorderingKey: @YES} mutableCopy];
    if (!hevc) comp[AVVideoProfileLevelKey] = AVVideoProfileLevelH264HighAutoLevel;
    AVAssetWriterInput *input = [AVAssetWriterInput assetWriterInputWithMediaType:AVMediaTypeVideo outputSettings:@{
      AVVideoCodecKey: hevc ? AVVideoCodecTypeHEVC : AVVideoCodecTypeH264, AVVideoWidthKey: @(w), AVVideoHeightKey: @(h),
      AVVideoCompressionPropertiesKey: comp,
      AVVideoColorPropertiesKey: @{AVVideoColorPrimariesKey: AVVideoColorPrimaries_ITU_R_709_2,
                                   AVVideoTransferFunctionKey: AVVideoTransferFunction_ITU_R_709_2,
                                   AVVideoYCbCrMatrixKey: AVVideoYCbCrMatrix_ITU_R_709_2}}];
    input.expectsMediaDataInRealTime = NO;
    AVAssetWriterInputPixelBufferAdaptor *adaptor = [AVAssetWriterInputPixelBufferAdaptor assetWriterInputPixelBufferAdaptorWithAssetWriterInput:input
      sourcePixelBufferAttributes:@{(id)kCVPixelBufferPixelFormatTypeKey: @(kCVPixelFormatType_32BGRA),
                                    (id)kCVPixelBufferWidthKey: @(w), (id)kCVPixelBufferHeightKey: @(h)}];
    [writer addInput:input];
    if (![writer startWriting]) fail([NSString stringWithFormat:@"writer: %@", writer.error]);
    [writer startSessionAtSourceTime:kCMTimeZero];

    CGColorSpaceRef rgb = CGColorSpaceCreateWithName(kCGColorSpaceSRGB);
    int64_t n = 0;
    while (img) {
      @autoreleasepool {
        if (CGImageGetWidth(img) != w || CGImageGetHeight(img) != h) fail([NSString stringWithFormat:@"frame %lld has another size", n]);
        while (!input.readyForMoreMediaData) usleep(2000);
        CVPixelBufferRef buf = NULL;
        if (!adaptor.pixelBufferPool || CVPixelBufferPoolCreatePixelBuffer(NULL, adaptor.pixelBufferPool, &buf) != kCVReturnSuccess)
          fail([NSString stringWithFormat:@"no pixel buffer: %@", writer.error]);
        CVPixelBufferLockBaseAddress(buf, 0);
        CGContextRef ctx = CGBitmapContextCreate(CVPixelBufferGetBaseAddress(buf), w, h, 8, CVPixelBufferGetBytesPerRow(buf), rgb,
                                                 kCGImageAlphaNoneSkipFirst | kCGBitmapByteOrder32Little);
        CGContextDrawImage(ctx, CGRectMake(0, 0, w, h), img);
        CGContextRelease(ctx);
        CVPixelBufferUnlockBaseAddress(buf, 0);
        // Tag the frame as already in BT.709 so VideoToolbox converts only the matrix, as ffmpeg does. Untagged, it re-applies
        // the 709 transfer curve to the sRGB values and every frame comes out about 10 levels darker.
        CVBufferSetAttachment(buf, kCVImageBufferColorPrimariesKey, kCVImageBufferColorPrimaries_ITU_R_709_2, kCVAttachmentMode_ShouldPropagate);
        CVBufferSetAttachment(buf, kCVImageBufferTransferFunctionKey, kCVImageBufferTransferFunction_ITU_R_709_2, kCVAttachmentMode_ShouldPropagate);
        CVBufferSetAttachment(buf, kCVImageBufferYCbCrMatrixKey, kCVImageBufferYCbCrMatrix_ITU_R_709_2, kCVAttachmentMode_ShouldPropagate);
        if (![adaptor appendPixelBuffer:buf withPresentationTime:CMTimeMake(n, fps)]) fail([NSString stringWithFormat:@"append: %@", writer.error]);
        CVPixelBufferRelease(buf);
        CGImageRelease(img);
        n++;
        img = decode(next());
      }
    }
    CGColorSpaceRelease(rgb);
    [input markAsFinished];
    dispatch_semaphore_t done = dispatch_semaphore_create(0);
    [writer finishWritingWithCompletionHandler:^{ dispatch_semaphore_signal(done); }];
    dispatch_semaphore_wait(done, DISPATCH_TIME_FOREVER);
    if (writer.status != AVAssetWriterStatusCompleted) fail([NSString stringWithFormat:@"finish: %@", writer.error]);
    printf("%s: %lld frames, %zux%zu, %d fps, %s %.0f Mb/s\n", out.path.UTF8String, n, w, h, fps, hevc ? "HEVC" : "H.264", bitrate / 1e6);
  }
  return 0;
}
