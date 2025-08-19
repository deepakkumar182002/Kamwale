import PostView from "@/components/PostView";
import { fetchPostById } from "@/lib/data";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

async function PostModal({ params }: Props) {
  const { id } = await params;
  const post = await fetchPostById(id);

  if (!post) {
    notFound();
  }

  return <PostView id={id} post={post} />;
}

export default PostModal;