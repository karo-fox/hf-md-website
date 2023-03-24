import { useRouter } from "next/router";
import ErrorPage from "next/error";
import { getProjectBySlug, getAllProjects } from "../../lib/api";
import Head from "next/head";
import markdownToHtml from "../../lib/markdownToHtml";
import type PostType from "../../interfaces/post";
import PostBody from "../../components/post-body";
import PostTitle from "../../components/post-title";
import ProjectHeader from "../../components/project-header";

type Props = {
  post: PostType;
  morePosts: PostType[];
  preview?: boolean;
};

export default function Post({ post }: Props) {
  const router = useRouter();
  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <>
      {router.isFallback ? (
        <PostTitle>Loading…</PostTitle>
      ) : (
        <>
          <article className="max-w-[800px] mx-auto">
            <Head>
              <title>{post.title}</title>
              <meta property="og:image" content={post.ogImage.url} />
            </Head>
            <ProjectHeader title={post.title} coverImage={post.coverImage} />
            <PostBody content={post.content} />
          </article>
        </>
      )}
    </>
  );
}

type Params = {
  params: {
    slug: string;
  };
};

export async function getStaticProps({ params }: Params) {
  const post = getProjectBySlug(params.slug, [
    "title",
    "slug",
    "content",
    "coverImage",
    "ogImage",
  ]);
  const content = await markdownToHtml(post.content || "");

  return {
    props: {
      post: {
        ...post,
        content,
      },
    },
  };
}

export async function getStaticPaths() {
  const posts = getAllProjects(["slug"]);

  return {
    paths: posts.map((post) => {
      return {
        params: {
          slug: post.slug,
        },
      };
    }),
    fallback: false,
  };
}
