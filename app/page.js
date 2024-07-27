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
