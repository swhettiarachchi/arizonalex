// Utility for interacting with the backend Agora token endpoint

/**
 * Fetch an Agora RTC token from the backend.
 * 
 * @param channelName The name of the channel the user is joining
 * @param uid The UID of the user (pass 0 for Agora to auto-assign)
 * @param role 'publisher' or 'audience'
 * @returns { token: string, uid: number, channelName: string }
 */
export async function fetchAgoraToken(channelName: string, uid: number | string = 0, role: 'publisher' | 'audience' = 'publisher') {
  try {
    const response = await fetch(`/api/agora/token?channelName=${encodeURIComponent(channelName)}&uid=${uid}&role=${role}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch token: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to generate token');
    }

    return data;
  } catch (error) {
    console.error('Error fetching Agora token:', error);
    throw error;
  }
}
