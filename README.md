# GitHub 레포지토리 컨트리뷰터 검증 앱 상세 구현 가이드

이 가이드에서는 Reclaim Protocol을 사용하여 GitHub 레포지토리의 컨트리뷰터를 검증하는 Next.js 애플리케이션을 구현하는 전체 과정을 설명합니다. 이 앱은 사용자의 GitHub 사용자 이름을 확인하고, 특정 레포지토리의 컨트리뷰터인지 검증합니다.

## 1. 메인 페이지 구현 (app/page.js)

메인 페이지에서는 GitHub 사용자 이름 확인 및 레포지토리 컨트리뷰터 검증 프로세스를 처리합니다.

```jsx
// app/page.js
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Reclaim } from "@reclaimprotocol/js-sdk";
import QRCode from "react-qr-code";

const APP_ID = "0x573cf0319aC1694E508A1A2e118475e2cD78981f";
const APP_SECRET =
  "0x565c4d0ef83cb5043bfdc5a3e55908131f2ace89b86aa3748a7c33c9d7b6edf8";
const PROVIDER_ID = "6d3f6753-7ee6-49ee-a545-62f1b1822ae5"; // GitHub UserName

// 여기에 확인하고자 하는 특정 레포지토리의 owner와 repo를 설정하세요.
const REPO_OWNER = "humblefirm";
const REPO_NAME = "guest-book";

const GitHubVerification = () => {
  const [url, setUrl] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [showContributeOption, setShowContributeOption] = useState(false);
  const router = useRouter();

  const reclaimClient = new Reclaim.ProofRequest(APP_ID);

  const handleVerificationSuccess = async (proof) => {
    console.log("Reclaim verification success", proof);
    try {
      const parameters = JSON.parse(proof[0].claimData.parameters);
      const username = parameters.paramValues.username;

      setStatus(
        `GitHub username verified: ${username}. Checking repository contribution...`
      );

      const response = await fetch(
        `/api/github/${REPO_OWNER}/${REPO_NAME}/${username}`
      );

      if (!response.ok) {
        throw new Error("Failed to verify contributor status");
      }

      const result = await response.json();
      if (result.isContributor) {
        setStatus("Verification successful! You are a contributor.");
        router.push("/congrats");
      } else {
        setError("You are not a contributor to the specified repository.");
        setShowContributeOption(true);
      }
    } catch (err) {
      console.error("Server verification failed", err);
      setError("Failed to verify contributor status. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerificationFailure = (error) => {
    console.error("Reclaim verification failed", error);
    setError("Verification failed. Please try again.");
    setIsVerifying(false);
  };

  const setupReclaimClient = async () => {
    await reclaimClient.buildProofRequest(PROVIDER_ID);
    reclaimClient.setSignature(
      await reclaimClient.generateSignature(APP_SECRET)
    );
  };

  const startReclaimSession = () => {
    reclaimClient.startSession({
      onSuccessCallback: handleVerificationSuccess,
      onFailureCallback: handleVerificationFailure,
    });
  };

  const generateVerificationRequest = async () => {
    setIsVerifying(true);
    setStatus("Generating verification request...");
    setError("");
    setShowContributeOption(false);
    try {
      reclaimClient.addContext(
        `user's GitHub username`,
        "for repository contribution verification"
      );
      await setupReclaimClient();
      const { requestUrl } = await reclaimClient.createVerificationRequest();
      setUrl(requestUrl);
      startReclaimSession();
      setStatus("Scan the QR code to verify your GitHub username");
    } catch (err) {
      setError("Failed to generate verification request. Please try again.");
      setIsVerifying(false);
    }
  };

  const handleContribute = () => {
    window.open(`https://github.com/${REPO_OWNER}/${REPO_NAME}`, "_blank");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-24">
      <h1 className="mb-8 text-4xl font-bold text-center">
        GitHub Repo Contributor Verification
      </h1>
      <p className="mb-8 text-xl text-center">
        Verify your contributions to the {REPO_OWNER}/{REPO_NAME} repository.
      </p>
      <button
        onClick={generateVerificationRequest}
        disabled={isVerifying}
        className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
      >
        {isVerifying ? "Verifying..." : "Verify GitHub Contributions"}
      </button>
      {status && (
        <div className="mb-4 p-4 bg-blue-100 text-blue-700 border border-blue-200 rounded max-w-md w-full">
          <p className="font-bold">Status</p>
          <p>{status}</p>
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-200 rounded max-w-md w-full">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      {showContributeOption && (
        <div className="mt-4 text-center">
          <p className="mb-2">Want to become a contributor?</p>
          <button
            onClick={handleContribute}
            className="px-4 py-2 font-bold text-white bg-green-500 rounded hover:bg-green-700"
          >
            Contribute Now
          </button>
        </div>
      )}
      {url && (
        <div className="mt-4">
          <QRCode value={url} />
        </div>
      )}
    </div>
  );
};

export default GitHubVerification;
```

## 2. 축하 페이지 구현 (app/congrats/page.js)

검증에 성공한 사용자를 위한 축하 페이지를 구현합니다.

```jsx
// app/congrats/page.js
"use client";
import React from "react";
import { useRouter } from "next/navigation";

const CongratulationsPage = () => {
  const router = useRouter();

  const handleStartClick = () => {
    alert("환영합니다! 이제 앱의 모든 기능을 사용하실 수 있습니다.");
    // 여기에 메인 앱 페이지로 리다이렉트하는 로직을 추가할 수 있습니다.
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-r from-green-400 to-blue-500">
      <div className="text-center">
        <h1 className="mb-6 text-4xl font-bold text-white md:text-6xl">
          축하합니다!
        </h1>
        <p className="mb-8 text-xl text-white md:text-2xl">
          GitHub 레포지토리 컨트리뷰터 검증에 성공하셨습니다.
        </p>
        <p className="mb-8 text-lg text-white md:text-xl">
          귀하의 기여에 감사드립니다. 이제 특별한 기능에 접근하실 수 있습니다.
        </p>
        <button
          className="px-6 py-3 mt-8 font-semibold text-blue-600 transition duration-300 bg-white rounded-full shadow-lg hover:bg-blue-100 hover:scale-105 active:scale-95"
          onClick={handleStartClick}
        >
          시작하기
        </button>
      </div>
    </div>
  );
};

export default CongratulationsPage;
```

## 3. GitHub API 연동 (app/api/github/[[...params]]/route.js)

GitHub API를 사용하여 레포지토리의 컨트리뷰터 목록을 가져오고, 특정 사용자의 컨트리뷰터 여부를 확인하는 API 라우트를 구현합니다.

```javascript
// app/api/github/[[...params]]/route.js
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
```

## 구현 과정 및 주요 기능 설명

1. 메인 페이지 (app/page.js):

   - Reclaim Protocol을 사용하여 GitHub 사용자 이름을 확인합니다.
   - QR 코드를 생성하여 사용자가 모바일 기기로 스캔할 수 있게 합니다.
   - 사용자 이름 확인 후, GitHub API를 호출하여 컨트리뷰터 여부를 확인합니다.
   - 검증 결과에 따라 적절한 피드백을 제공하고, 성공 시 축하 페이지로 이동합니다.

2. 축하 페이지 (app/congrats/page.js):

   - 검증 성공 시 사용자에게 축하 메시지를 표시합니다.
   - 앱의 다음 단계로 진행할 수 있는 버튼을 제공합니다.

3. GitHub API 연동 (app/api/github/[[...params]]/route.js):
   - GitHub API를 사용하여 특정 레포지토리의 모든 컨트리뷰터 목록을 가져옵니다.
   - 페이지네이션을 처리하여 대규모 레포지토리의 모든 컨트리뷰터를 확인합니다.
   - 특정 사용자의 컨트리뷰터 여부를 확인하고 결과를 반환합니다.

## 구현 시 주의사항

- `APP_SECRET`은 서버 측에서 관리해야 합니다. 이 예제에서는 학습을 위해 클라이언트 측 코드에 포함되어 있지만, 실제 구현에서는 절대 이렇게 하면 안 됩니다.
- API 키와 같은 민감한 정보는 환경 변수로 관리해야 합니다.
