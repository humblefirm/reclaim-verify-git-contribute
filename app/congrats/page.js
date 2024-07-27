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
