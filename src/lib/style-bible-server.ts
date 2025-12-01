/**
 * Server-only Style Bible utilities
 *
 * This file contains server-side only functions (fs, path)
 * Import this ONLY in API routes, never in client components
 */

import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Get Santa reference image as base64 for Veo/NanoBanana
 * This ensures consistent Santa appearance across all scenes
 *
 * IMPORTANT: Only use in API routes (server-side)
 */
export function getSantaReferenceImage(): { base64: string; mimeType: 'image/png' } {
  try {
    const imagePath = join(process.cwd(), 'public', 'assets', 'santa-avatar-reference.png')
    const imageBuffer = readFileSync(imagePath)
    const base64 = imageBuffer.toString('base64')

    return {
      base64,
      mimeType: 'image/png',
    }
  } catch (error) {
    console.error('[StyleBible] Failed to load Santa reference image:', error)
    throw new Error('Santa reference image not found at public/assets/santa-avatar-reference.png')
  }
}

/**
 * Check if Santa reference image exists
 */
export function santaReferenceImageExists(): boolean {
  try {
    const fs = require('fs')
    const path = require('path')
    const imagePath = path.join(process.cwd(), 'public', 'assets', 'santa-avatar-reference.png')
    return fs.existsSync(imagePath)
  } catch {
    return false
  }
}

/**
 * Get Elf reference image as base64 for NanoBanana
 * This ensures consistent elf appearance across all scenes
 *
 * IMPORTANT: Only use in API routes (server-side)
 */
export function getElfReferenceImage(): { base64: string; mimeType: 'image/png' } {
  try {
    const imagePath = join(process.cwd(), 'public', 'assets', 'elf-reference.png')
    const imageBuffer = readFileSync(imagePath)
    const base64 = imageBuffer.toString('base64')

    return {
      base64,
      mimeType: 'image/png',
    }
  } catch (error) {
    console.error('[StyleBible] Failed to load Elf reference image:', error)
    throw new Error('Elf reference image not found at public/assets/elf-reference.png')
  }
}

/**
 * Check if Elf reference image exists
 */
export function elfReferenceImageExists(): boolean {
  try {
    const fs = require('fs')
    const path = require('path')
    const imagePath = path.join(process.cwd(), 'public', 'assets', 'elf-reference.png')
    return fs.existsSync(imagePath)
  } catch {
    return false
  }
}
