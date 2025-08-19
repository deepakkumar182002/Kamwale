import FollowersModal from "@/components/FollowersModal";
import { fetchProfile } from "@/lib/data";

interface Props {
  params: Promise<{
    username: string;
  }>;
}

async function FollowersPage({ params }: Props) {
  const { username } = await params;
  const profile = await fetchProfile(username);
  const followers = profile?.followedBy;

  return <FollowersModal followers={followers} username={username} />;
}

export default FollowersPage;
