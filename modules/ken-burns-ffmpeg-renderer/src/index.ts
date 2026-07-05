/**
 * Ken Burns Video Effect Renderer
 *
 * CLI video generation: image → Ken Burns zoom/pan effect + optional audio → MP4.
 * Uses ffmpeg with bundled binary (ffmpeg-static) for cross-platform support.
 *
 * Ken Burns: smooth zoom-in/out + panning across still image over configurable duration.
 * Ideal for slideshow→video, social content, or storyboard rendering.
 *
 * Usage (Node.js):
 *   import { KenBurnsRenderer } from './index.ts';
 *   const renderer = new KenBurnsRenderer();
 *   const result = await renderer.renderImage({
 *     inputPath: './photo.jpg',
 *     duration: 5,           // 5 second effect
 *     zoomStart: 1.0,        // 100% zoom
 *     zoomEnd: 1.2,          // 120% zoom (20% zoom in)
 *     outputPath: './output/video.mp4',
 *     audioPad: './voiceover.wav'  // optional
 *   });
 */

import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import ffmpegPath from 'ffmpeg-static';

const FPS = 30;

function escapeFilterPath(p: string): string {
  return p.replace(/\/g, '/').replace(/:/g, '\:');
}

export interface KenBurnsOptions {
  inputPath: string;
  duration: number;      // seconds
  zoomStart?: number;    // default 1.0
  zoomEnd?: number;      // default 1.2 (20% zoom in)
  panX?: number;         // -1 to 1, pan direction
  panY?: number;         // -1 to 1, pan direction
  outputPath: string;
  audioPad?: string;     // optional voiceover/bgm
  fps?: number;          // default 30
}

export class KenBurnsRenderer {
  async renderImage(opts: KenBurnsOptions): Promise<{ success: boolean; path: string; error?: string }> {
    try {
      const {
        inputPath,
        duration,
        zoomStart = 1.0,
        zoomEnd = 1.2,
        panX = 0,
        panY = 0.1,
        outputPath,
        audioPad,
        fps = FPS
      } = opts;

      if (!existsSync(inputPath)) {
        return { success: false, path: outputPath, error: `Input not found: ${inputPath}` };
      }

      // Ensure output directory exists
      const outDir = path.dirname(outputPath);
      await mkdir(outDir, { recursive: true });

      // Build ffmpeg filter: zoompan effect
      const frames = Math.ceil(duration * fps);
      const panXAmount = panX * 100;
      const panYAmount = panY * 100;

      const zoompanFilter = `zoompan=z='min(zoom+${(zoomEnd - zoomStart) / duration / fps},${zoomEnd})':x='iw/2-(iw/zoom/2)-${panXAmount}':y='ih/2-(ih/zoom/2)-${panYAmount}':d=${fps}:s=${1920}x${1080}:fps=${fps}`;

      const ffmpegArgs = [
        '-loop', '1',
        '-i', inputPath,
        '-vf', zoompanFilter,
        '-t', String(duration),
        '-pix_fmt', 'yuv420p'
      ];

      // Add audio if provided
      if (audioPad && existsSync(audioPad)) {
        ffmpegArgs.push('-i', audioPad);
        ffmpegArgs.push('-c:a', 'aac');
        ffmpegArgs.push('-shortest');
      }

      ffmpegArgs.push('-y', outputPath);

      return new Promise((resolve) => {
        const ffmpeg = spawn(ffmpegPath || 'ffmpeg', ffmpegArgs);

        let stderr = '';
        ffmpeg.stderr?.on('data', (data) => {
          stderr += data.toString();
        });

        ffmpeg.on('close', (code) => {
          if (code === 0) {
            resolve({ success: true, path: outputPath });
          } else {
            resolve({ success: false, path: outputPath, error: `ffmpeg exited ${code}: ${stderr}` });
          }
        });

        ffmpeg.on('error', (err) => {
          resolve({ success: false, path: outputPath, error: err.message });
        });
      });
    } catch (err: any) {
      return { success: false, path: opts.outputPath, error: err.message };
    }
  }

  async renderImageSequence(
    images: KenBurnsOptions[],
    outputPath: string
  ): Promise<{ success: boolean; path: string; error?: string }> {
    // Render each image to intermediate MP4, then concat
    const clips = [];
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const clipPath = outputPath.replace(/\.mp4$/, `_clip${i}.mp4`);
      const result = await this.renderImage({ ...img, outputPath: clipPath });
      if (!result.success) {
        return result;
      }
      clips.push(clipPath);
    }

    // Concat clips
    const concatFile = outputPath.replace(/\.mp4$/, '_concat.txt');
    const concatList = clips.map(c => `file '${c}'`).join('\n');
    await writeFile(concatFile, concatList);

    return new Promise((resolve) => {
      const ffmpeg = spawn(ffmpegPath || 'ffmpeg', [
        '-f', 'concat',
        '-safe', '0',
        '-i', concatFile,
        '-c', 'copy',
        '-y', outputPath
      ]);

      let stderr = '';
      ffmpeg.stderr?.on('data', (data) => { stderr += data.toString(); });
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, path: outputPath });
        } else {
          resolve({ success: false, path: outputPath, error: `concat failed: ${stderr}` });
        }
      });
      ffmpeg.on('error', (err) => {
        resolve({ success: false, path: outputPath, error: err.message });
      });
    });
  }
}
