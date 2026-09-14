"use client";

import { ChangeEvent, useMemo, useState } from "react";

const ratios = ["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "5:4", "4:5", "21:9"];
const sizes = ["1K", "2K", "4K"];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [imageSize, setImageSize] = useState("1K");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const modeLabel = useMemo(() => referenceImage ? "이미지 편집" : "이미지 생성", [referenceImage]);

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("참고 이미지는 8MB 이하로 올려주세요.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setReferenceImage(String(reader.result));
      setError("");
    };
    reader.readAsDataURL(file);
  }

  async function generate() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio, imageSize, referenceImage }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "생성에 실패했습니다.");
      setResult(data.image);
    } catch (err) {
      setError(err instanceof Error ? err.message : "생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function download() {
    if (!result) return;
    const link = document.createElement("a");
    link.href = result;
    link.download = `nano-banana-2-${Date.now()}.png`;
    link.click();
  }

  return (
    <main className="shell">
      <section className="hero">
        <div className="badge">🍌🍌 Gemini 3.1 Flash Image</div>
        <h1>Nano Banana 2<br />Image Bot</h1>
        <p>프롬프트로 새 이미지를 만들거나, 참고 이미지를 올려 원하는 방식으로 편집하세요.</p>
      </section>

      <section className="workspace">
        <div className="panel controls">
          <div className="sectionTitle">
            <span>{modeLabel}</span>
            <small>gemini-3.1-flash-image</small>
          </div>

          <label className="fieldLabel" htmlFor="prompt">프롬프트</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={referenceImage ? "예: 이 사진의 배경을 비 오는 도쿄의 밤거리로 바꿔줘. 인물은 그대로 유지해줘." : "예: 푸른 새벽빛의 미래형 서울, 영화적 조명, 초광각 사진, 사실적인 스타일"}
            rows={8}
            maxLength={8000}
          />
          <div className="counter">{prompt.length.toLocaleString()} / 8,000</div>

          <div className="row">
            <div className="selectGroup">
              <label className="fieldLabel">화면 비율</label>
              <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
                {ratios.map((ratio) => <option key={ratio}>{ratio}</option>)}
              </select>
            </div>
            <div className="selectGroup">
              <label className="fieldLabel">해상도</label>
              <select value={imageSize} onChange={(e) => setImageSize(e.target.value)}>
                {sizes.map((size) => <option key={size}>{size}</option>)}
              </select>
            </div>
          </div>

          <label className="uploadBox">
            <input type="file" accept="image/*" onChange={handleFile} />
            {referenceImage ? (
              <>
                <img src={referenceImage} alt="참고 이미지" />
                <span>참고 이미지 변경</span>
              </>
            ) : (
              <>
                <strong>+ 참고 이미지 추가</strong>
                <span>선택 사항 · 올리면 이미지 편집 모드</span>
              </>
            )}
          </label>

          {referenceImage && (
            <button className="textButton" onClick={() => setReferenceImage(null)}>참고 이미지 제거</button>
          )}

          <button className="generateButton" disabled={!prompt.trim() || loading} onClick={generate}>
            {loading ? <><span className="spinner" /> 생성 중...</> : <>✨ {modeLabel}</>}
          </button>

          {error && <div className="error">{error}</div>}
        </div>

        <div className="panel resultPanel">
          <div className="sectionTitle">
            <span>결과</span>
            {result && <button className="downloadButton" onClick={download}>다운로드</button>}
          </div>

          <div className={`canvas ${result ? "hasImage" : ""}`}>
            {result ? (
              <img src={result} alt="Nano Banana 2 생성 결과" />
            ) : loading ? (
              <div className="emptyState">
                <div className="bigSpinner" />
                <strong>Nano Banana 2가 이미지를 만들고 있어요</strong>
                <span>고해상도일수록 조금 더 오래 걸릴 수 있습니다.</span>
              </div>
            ) : (
              <div className="emptyState">
                <div className="banana">🍌</div>
                <strong>생성된 이미지가 여기에 표시됩니다</strong>
                <span>왼쪽에서 프롬프트와 옵션을 설정하세요.</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer>API 키는 브라우저로 전달되지 않고 서버에서만 사용됩니다.</footer>
    </main>
  );
}
