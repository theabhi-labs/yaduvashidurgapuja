import { User } from '../models/User';

/**
 * Clean & slugify raw text into an Instagram-style username:
 * - Lowercase
 * - Only a-z, 0-9, underscore (_), and dot (.)
 * - Trim leading/trailing underscores and dots
 */
export function slugifyUsername(raw: string): string {
  if (!raw) return 'devotee';

  let cleaned = raw
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_') // Replace spaces with underscore
    .replace(/[^a-z0-9_.]/g, '') // Remove non-allowed chars
    .replace(/[._]{2,}/g, '_') // Collapse multiple underscores/dots
    .replace(/^[._]+|[._]+$/g, ''); // Trim leading/trailing symbols

  if (cleaned.length < 3) {
    cleaned = (cleaned + 'devotee').slice(0, 15);
  }

  return cleaned.slice(0, 25);
}

/**
 * Generate 3-4 clean, appealing Instagram-style username suggestions
 */
export function generateUsernameSuggestions(base: string): string[] {
  const cleanBase = slugifyUsername(base);
  const randomNum1 = Math.floor(10 + Math.random() * 90);
  const randomNum2 = Math.floor(100 + Math.random() * 900);
  const year = new Date().getFullYear();

  return [
    `${cleanBase}_${randomNum1}`,
    `${cleanBase}${randomNum2}`,
    `${cleanBase}_${year}`,
    `real_${cleanBase}`,
    `${cleanBase}.official`,
  ].slice(0, 4);
}

/**
 * Generate a guaranteed unique available username from name or requested username
 */
export async function generateAvailableUsername(
  name: string,
  requestedUsername?: string
): Promise<string> {
  const base = slugifyUsername(requestedUsername || name);

  // 1. Check if base is available
  const existing = await User.findOne({ username: base });
  if (!existing) {
    return base;
  }

  // 2. Try simple suffix increments
  for (let i = 1; i <= 20; i++) {
    const candidate = `${base}${i}`;
    const taken = await User.findOne({ username: candidate });
    if (!taken) {
      return candidate;
    }
  }

  // 3. Fallback to random suffix
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${base}_${randomSuffix}`;
}

/**
 * Check username availability and return suggestions if taken
 */
export async function checkUsernameAvailability(
  username: string,
  currentUserId?: string
): Promise<{ available: boolean; username: string; suggestions: string[] }> {
  const clean = slugifyUsername(username);

  const query: any = { username: clean };
  if (currentUserId) {
    query._id = { $ne: currentUserId };
  }

  const existing = await User.findOne(query);

  if (!existing) {
    return {
      available: true,
      username: clean,
      suggestions: [],
    };
  }

  // Generate recommendations and filter for available ones
  const rawSuggestions = generateUsernameSuggestions(clean);
  const availableSuggestions: string[] = [];

  for (const candidate of rawSuggestions) {
    const isTaken = await User.findOne({ username: candidate });
    if (!isTaken) {
      availableSuggestions.push(candidate);
    }
  }

  return {
    available: false,
    username: clean,
    suggestions: availableSuggestions.length > 0 ? availableSuggestions : [`${clean}_${Math.floor(100 + Math.random() * 900)}`],
  };
}

/**
 * Backfill / Migration: Ensure all existing users in database have a unique username
 */
export async function ensureAllUsersHaveUsernames(): Promise<number> {
  const usersWithoutUsername = await User.find({
    $or: [{ username: { $exists: false } }, { username: null }, { username: '' }],
  });

  let count = 0;
  for (const user of usersWithoutUsername) {
    const uniqueUsername = await generateAvailableUsername(user.name);
    user.username = uniqueUsername;
    await user.save();
    count++;
  }

  return count;
}
