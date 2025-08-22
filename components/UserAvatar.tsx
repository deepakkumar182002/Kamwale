"use client";

import { Avatar } from "@/components/ui/avatar";
import type { AvatarProps } from "@radix-ui/react-avatar";
import type { User } from "next-auth";
import Image from "next/image";
import { useState } from "react";

type Props = Partial<AvatarProps> & {
  user: User | undefined;
};

function UserAvatar({ user, ...avatarProps }: Props) {
  const [imageError, setImageError] = useState(false);
  
  // Simple gray circle with user icon as data URL
  const defaultAvatar = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNFNUU3RUIiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM3IiByPSIxMyIgZmlsbD0iIzlDQTNBRiIvPjxwYXRoIGQ9Ik0zMCA3NWMwLTExIDktMjAgMjAtMjBzMjAgOSAyMCAyMHY1SDMwdi01eiIgZmlsbD0iIzlDQTNBRiIvPjwvc3ZnPg==";
  const imageUrl = user?.image && !imageError ? user.image : defaultAvatar;
  
  return (
    <Avatar className="relative h-8 w-8" {...avatarProps}>
      <Image
        src={imageUrl}
        fill
        alt={`${user?.name || 'User'}'s profile picture`}
        className="rounded-full object-cover"
        onError={() => setImageError(true)}
        unoptimized={imageError || imageUrl === defaultAvatar} // Don't optimize fallback images
      />
    </Avatar>
  );
}

export default UserAvatar;
