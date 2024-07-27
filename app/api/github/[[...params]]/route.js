// app/api/github/%5B%5B...params%5D%5D/route.js
import { NextResponse } from "next/server";

const GITHUB_API_URL = "https://api.github.com";

export async function GET(request, { params }) {
  // params 객체에서 params 배열 추출
  const { params: urlParams } = params;

  // urlParams가 없거나 길이가 2 미만이면 에러
  if (!urlParams || urlParams.length < 2) {
    return NextResponse.json(
      { error: "Owner and repo parameters are required" },
      { status: 400 }
    );
  }

  const [owner, repo, contributor] = urlParams;

  try {
    const contributors = await fetchAllContributors(owner, repo);

    if (contributor) {
      const isContributor = contributors.some(
        (c) => c.login.toLowerCase() === contributor.toLowerCase()
      );
      return NextResponse.json({ isContributor });
    }

    return NextResponse.json(contributors);
  } catch (error) {
    console.error("Error fetching contributors:", error);
    return NextResponse.json(
      { error: "Failed to fetch contributors" },
      { status: 500 }
    );
  }
}

async function fetchAllContributors(
  owner,
  repo,
  page = 1,
  perPage = 100,
  allContributors = []
) {
  const response = await fetch(
    `${GITHUB_API_URL}/repos/${owner}/${repo}/contributors?page=${page}&per_page=${perPage}`,
    {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "NextJS-App",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API responded with status ${response.status}`);
  }

  const contributors = await response.json();
  allContributors.push(...contributors);

  // Check if there are more pages
  const linkHeader = response.headers.get("Link");
  if (linkHeader && linkHeader.includes('rel="next"')) {
    return fetchAllContributors(
      owner,
      repo,
      page + 1,
      perPage,
      allContributors
    );
  }

  return allContributors;
}
