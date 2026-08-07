export interface CustomReward {
  id: string;
  broadcaster_id: string;
  broadcaster_login: string;
  broadcaster_name: string;
  title: string;
  cost: number;
  prompt: string;
  is_enabled: boolean;
  background_color: string;
  default_image: {
    url_1x: string;
    url_2x: string;
    url_4x: string;
  };
  image: {
    url_1x: string | null;
    url_2x: string | null;
    url_4x: string | null;
  };
  is_user_input_required: boolean;
  max_per_stream: {
    is_enabled: boolean;
    max_per_stream: number;
  };
  max_per_user_per_stream: {
    is_enabled: boolean;
    max_per_user_per_stream: number;
  };
  global_cooldown: {
    is_enabled: boolean;
    global_cooldown_seconds: number;
  };
  should_redemptions_skip_request_queue: boolean;
  redemptions_redeemed_current_stream: number;
  cooldown_expires_at: string | null;
}

export interface CreateRewardParams {
  title: string;
  cost: number;
  prompt?: string;
  is_enabled?: boolean;
  background_color?: string;
  is_user_input_required?: boolean;
  max_per_stream?: { is_enabled: boolean; max_per_stream: number };
  max_per_user_per_stream?: {
    is_enabled: boolean;
    max_per_user_per_stream: number;
  };
  global_cooldown?: { is_enabled: boolean; global_cooldown_seconds: number };
  should_redemptions_skip_request_queue?: boolean;
}

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;

export async function twitchFetch(
  endpoint: string,
  options: RequestInit,
  token: string,
) {
  const response = await fetch(`https://api.twitch.tv/helix${endpoint}`, {
    ...options,
    headers: {
      "Client-ID": CLIENT_ID,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    console.error("Erro Twitch:", response.status, error);

    throw new Error(error?.message || `Erro Twitch: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function createCustomReward(
  token: string,
  user_id: string,
  params: CreateRewardParams,
): Promise<CustomReward> {
  const body = {
    broadcaster_id: user_id,
    ...params,
  };

  const data = await twitchFetch(
    "/channel_points/custom_rewards",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    token,
  );

  return data.data[0];
}

export async function getCustomRewards(
  token: string,
  user_id: string,
  onlyManageable: boolean = false,
): Promise<CustomReward[]> {
  const params = new URLSearchParams({
    broadcaster_id: user_id,
    only_manageable_rewards: onlyManageable.toString(),
  });

  const data = await twitchFetch(
    `/channel_points/custom_rewards?${params}`,
    {},
    token,
  );

  console.log("Custom Rewards:", data.data);
  return data.data;
}

export async function updateCustomReward(
  token: string,
  user_id: string,
  reward_id: string,
  params: Partial<CreateRewardParams>,
): Promise<CustomReward> {
  const data = await twitchFetch(
    `/channel_points/custom_rewards?broadcaster_id=${user_id}&id=${reward_id}`,
    {
      method: "PATCH",
      body: JSON.stringify(params),
    },
    token,
  );

  return data.data[0];
}

export async function deleteCustomReward(
  token: string,
  user_id: string,
  reward_id: string,
): Promise<void> {
  await twitchFetch(
    `/channel_points/custom_rewards?broadcaster_id=${user_id}&id=${reward_id}`,
    {
      method: "DELETE",
    },
    token,
  );
}
