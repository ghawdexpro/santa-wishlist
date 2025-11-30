/**
 * FFmpeg Video Stitching
 * Combines multiple video segments (HeyGen + Veo) into a single final video
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'

const execAsync = promisify(exec)

export interface VideoSegment {
  url: string
  type: 'heygen' | 'veo'
  order: number
  durationSeconds?: number
}

/**
 * Download video from URL to local file
 */
export async function downloadVideo(url: string, filePath: string): Promise<void> {
  console.log(`[FFmpeg] Downloading ${url} to ${filePath}...`)

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.status} ${response.statusText}`)
  }

  const buffer = await response.arrayBuffer()
  await fs.writeFile(filePath, Buffer.from(buffer))

  console.log(`[FFmpeg] Downloaded ${filePath} (${buffer.byteLength} bytes)`)
}

/**
 * Stitch multiple video segments into final video using FFmpeg
 * Uses concat demuxer for fast concatenation (copy codec, no re-encoding)
 */
export async function stitchFinalVideo(
  segments: VideoSegment[],
  outputPath: string
): Promise<string> {
  const tempDir = path.join('/tmp', `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)

  console.log(`[FFmpeg] Creating temp directory: ${tempDir}`)
  await fs.mkdir(tempDir, { recursive: true })

  try {
    // 1. Download all segments in order
    console.log(`[FFmpeg] Downloading ${segments.length} segments...`)
    const sortedSegments = [...segments].sort((a, b) => a.order - b.order)

    const files: string[] = []
    for (let i = 0; i < sortedSegments.length; i++) {
      const seg = sortedSegments[i]
      const fileName = `${i.toString().padStart(2, '0')}-${seg.type}.mp4`
      const filePath = path.join(tempDir, fileName)

      await downloadVideo(seg.url, filePath)
      files.push(filePath)

      console.log(`[FFmpeg] Downloaded segment ${i + 1}/${segments.length}: ${seg.type}`)
    }

    // 2. Create FFmpeg concat file
    console.log(`[FFmpeg] Creating concat file...`)
    const concatFile = path.join(tempDir, 'concat.txt')
    const concatContent = files.map(f => `file '${f}'`).join('\n')
    await fs.writeFile(concatFile, concatContent)

    console.log(`[FFmpeg] Concat file: ${concatContent}`)

    // 3. Run FFmpeg (copy codec for speed - no re-encoding)
    console.log(`[FFmpeg] Starting FFmpeg concat...`)
    const ffmpegCmd = `ffmpeg -f concat -safe 0 -i "${concatFile}" -c copy "${outputPath}" -y`

    console.log(`[FFmpeg] Command: ${ffmpegCmd}`)

    const { stdout, stderr } = await execAsync(ffmpegCmd, {
      timeout: 300000, // 5 minutes
      maxBuffer: 50 * 1024 * 1024, // 50MB buffer
    })

    console.log(`[FFmpeg] FFmpeg stdout:`, stdout)
    console.log(`[FFmpeg] FFmpeg stderr:`, stderr)

    // 4. Verify output
    console.log(`[FFmpeg] Verifying output...`)
    const stats = await fs.stat(outputPath)

    if (!stats.isFile() || stats.size === 0) {
      throw new Error(`FFmpeg output file not created or is empty: ${outputPath}`)
    }

    console.log(`[FFmpeg] Final video created: ${outputPath} (${stats.size} bytes)`)

    return outputPath
  } catch (error) {
    console.error(`[FFmpeg] Error:`, error)
    throw error
  } finally {
    // Cleanup temp files
    console.log(`[FFmpeg] Cleaning up temp directory: ${tempDir}`)
    try {
      await fs.rm(tempDir, { recursive: true, force: true })
    } catch (cleanupError) {
      console.error(`[FFmpeg] Cleanup error:`, cleanupError)
    }
  }
}
