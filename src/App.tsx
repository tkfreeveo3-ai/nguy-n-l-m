import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  Film, 
  User, 
  Video, 
  Radio, 
  Smile, 
  Compass, 
  ArrowRight,
  Lightbulb,
  FileText,
  Clock,
  AlertTriangle,
  PlayCircle
} from "lucide-react";

interface Scene {
  id: number;
  timeRange: string;
  characters: string;
  settingAndCamera: string;
  dialogue: string;
  rawPrompt: string;
}

interface ScriptResult {
  title: string;
  generalSummary: string;
  scenes: Scene[];
  conclusion: string;
}

// Preset templates to help the user test the app quickly
const PRESETS = [
  {
    name: "Bình Chữa Cháy Bộ Quốc Phòng",
    product: "BinhChuaChayBoQuocPhong_4kg",
    idea: "Doanh nghiệp mua bình chữa cháy uy tín, an tâm tuyệt đối vì có tem kiểm định QR thật, đáp ứng mọi quy định của đoàn kiểm tra Phòng cháy chữa cháy.",
    char1: "Ngọc (Nam - lịch lãm, vai chủ kho xưởng lo lắng an toàn)",
    char2: "Loan (Nữ - năng động, vai nhân viên tư vấn showroom Phòng cháy chữa cháy)",
    tone: "Trực diện, uy tín, dứt khoát, mang tinh thần Gen Z chủ doanh nghiệp",
    background: "@Showroom_PhongChayChuaChay sang trọng, hiện đại, trưng bày bóng loáng"
  },
  {
    name: "Kem Chống Nắng GenZ",
    product: "KemChongNangGenZ_SPF50",
    idea: "Nam thanh niên đi biển quên bôi kem và cái kết cháy nắng đen sạm, được bạn gái cứu nguy kịp thời với dòng kem kiềm dầu nâng tông.",
    char1: "Ngọc (Nam - ngớ ngẩn nhưng dễ thương, điệu đà nửa mùa)",
    char2: "Loan (Nữ - lạnh lùng cá tính, luôn mang bảo bối)",
    tone: "Hài hước, trêu đùa nhau, nhanh mạnh, văn phong cực kỳ Gen Z",
    background: "@BaiBien_NangGat cát trắng, biển xanh, camera lia nhanh"
  },
  {
    name: "Khóa Học TikTok Triệu View",
    product: "KhoaHocTikTok_SieuViec",
    idea: "Một bên làm mãi không lên view, một bên vừa xây kênh đã nổ trăm đơn hàng nhờ bí quyết kịch bản chuẩn SEO và giữ chân 3s đầu.",
    char1: "Ngọc (Nam - sầu đời, cặm cụi edit video đến 2h sáng nhưng lẹt đẹt 100 view)",
    char2: "Loan (Nữ - rạng rỡ, thảnh thơi nhâm nhi cà phê và nổ đơn liên tục)",
    tone: "Chia sẻ thực tế, đánh mạnh nỗi đau của creator, truyền cảm hứng hành động",
    background: "@QuanCaPhe_Chill không gian xanh mát hiện đại"
  }
];

export default function App() {
  // Input states
  const [product, setProduct] = useState("");
  const [idea, setIdea] = useState("");
  const [char1, setChar1] = useState("Ngọc (Nam - lịch lãm)");
  const [char2, setChar2] = useState("Loan (Nữ - năng động)");
  const [tone, setTone] = useState("Ngắn gọn, súc tích, Gen Z, thực tế");
  const [background, setBackground] = useState("@Showroom_PhongChayChuaChay sang trọng");
  const [duration, setDuration] = useState<number>(40);

  // App UI states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScriptResult | null>(null);
  
  // Clipboard copy feedback states
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedSceneId, setCopiedSceneId] = useState<number | null>(null);

  // Active scene card tab in results view
  const [activeSceneTab, setActiveSceneTab] = useState<number>(1);

  const getStepsList = () => [
    "Đang phân tích ý tưởng & sản phẩm của bạn...",
    "Đang thiết lập tiêu đề cuốn hút (Hook 3 giây đầu)...",
    "Đang lập kịch bản tổng thể dẫn dắt câu chuyện...",
    `Đang chia nhỏ ${duration / 10} phân cảnh 10s đồng nhất nhân vật...`,
    "Đang định hình bối cảnh, góc máy kỹ thuật [Toàn/Trung/Cận]...",
    "Đang chuốt lại lời thoại đậm chất Gen Z thực tế..."
  ];

  // Loading steps animation simulating an advanced scenario planning engine
  const runLoadingAnimation = () => {
    const steps = getStepsList();
    
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 1500);

    return {
      intervalId: interval,
      steps
    };
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setProduct(preset.product);
    setIdea(preset.idea);
    setChar1(preset.char1);
    setChar2(preset.char2);
    setTone(preset.tone);
    setBackground(preset.background);
    setError(null);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product.trim() || !idea.trim()) {
      setError("Vui lòng điền thông tin Sản phẩm & Ý tưởng thương hiệu của bạn.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    const { intervalId, steps } = runLoadingAnimation();

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product,
          idea,
          char1,
          char2,
          tone,
          background,
          duration
        })
      });

      const data = await response.json();
      clearInterval(intervalId);

      if (!response.ok) {
        throw new Error(data.error || "Gặp sự cố khi kết nối với máy chủ AI.");
      }

      setResult(data);
      setActiveSceneTab(1);
    } catch (err: any) {
      clearInterval(intervalId);
      setError(err.message || "Đã xảy ra lỗi không xác định. Vui lòng kiểm tra lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // Quick clipboard copy helpers
  const copyText = (text: string, type: "all" | "summary" | "scene", sceneId?: number) => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === "all") {
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
      } else if (type === "summary") {
        setCopiedSummary(true);
        setTimeout(() => setCopiedSummary(false), 2000);
      } else if (type === "scene" && sceneId !== undefined) {
        setCopiedSceneId(sceneId);
        setTimeout(() => setCopiedSceneId(null), 2000);
      }
    });
  };

  // Format entire script for copy
  const getFullFormattedText = () => {
    if (!result) return "";
    let txt = `PHẦN 1: KỊCH BẢN TỔNG THỂ\n`;
    txt += `${result.generalSummary.trim()}\n\n`;
    txt += `--------------------------------------------------\n`;
    txt += `PHẦN 2: KỊCH BẢN ${duration}S - ${result.scenes.length} PHÂN CẢNH ĐỒNG NHẤT\n\n`;
    
    result.scenes.forEach((s, index) => {
      txt += `${s.id}.\n`;
      
      // Ensure clean prefixing for 'Nhân vật'
      let charLine = s.characters.trim();
      if (!charLine.toLowerCase().startsWith("nhân vật:")) {
        charLine = `Nhân vật: ${charLine}`;
      }
      txt += `${charLine}\n`;
      
      // Ensure clean prefixing for 'Bối cảnh/Góc máy'
      let setLine = s.settingAndCamera.trim();
      if (!setLine.toLowerCase().startsWith("bối cảnh") && !setLine.toLowerCase().startsWith("bối cảnh/góc máy:")) {
        setLine = `Bối cảnh/Góc máy: ${setLine}`;
      }
      txt += `${setLine}\n`;
      
      // Ensure clean formatting of 'Lời thoại'
      let dialLine = s.dialogue.trim();
      if (!dialLine.toLowerCase().startsWith("lời thoại:")) {
        dialLine = `Lời thoại:\n${dialLine}`;
      }
      txt += `${dialLine}\n`;
      
      if (index < result.scenes.length - 1) {
        txt += `\n--------------------------------------------------\n`;
      }
    });
    
    return txt;
  };

  const stepsList = getStepsList();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      {/* Decorative top bar */}
      <div className="h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 w-full" id="deco-bar" />

      {/* Header Container */}
      <header className="bg-white border-b border-slate-200 py-6 px-4 md:px-8" id="header-container">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100" id="logo-icon-wrap">
              <Film className="w-8 h-8 stroke-[2]" id="logo-icon" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900" id="main-title">
                AI Biên Kịch Video Ngắn
              </h1>
              <p className="text-sm text-slate-500 mt-0.5" id="main-subtitle">
                Biến ý tưởng thô thành kịch bản phân cảnh đồng nhất tùy chọn thời lượng, tối ưu prompt sinh video ngắn TikTok/Reels/Shorts
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center text-xs bg-slate-100 p-1.5 rounded-lg border border-slate-200" id="actor-names-badge">
            <span className="font-semibold text-slate-600 px-2 py-1">Nhân vật mặc định:</span>
            <span className="bg-white text-rose-600 font-medium px-2 py-0.5 rounded border border-rose-100 shadow-sm">
              🧑 Ngọc (Nam)
            </span>
            <span className="bg-white text-blue-600 font-medium px-2 py-0.5 rounded border border-blue-100 shadow-sm">
              👩 Loan (Nữ)
            </span>
          </div>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8" id="main-workspace">
        
        {/* Preset Selector */}
        <section className="mb-8" id="preset-selector-section">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-slate-700 font-medium text-sm">
              <Lightbulb className="w-4.5 h-4.5 text-amber-500" />
              <span>Thử nghiệm nhanh bằng các ý tưởng mẫu:</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  id={`preset-btn-${idx}`}
                  onClick={() => applyPreset(preset)}
                  className="text-xs bg-slate-50 hover:bg-slate-100 hover:text-slate-900 text-slate-600 px-3.5 py-2.5 rounded-lg border border-slate-200 transition-all flex items-center gap-1.5 font-medium cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-red-500" />
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="workspace-grid">
          
          {/* LEFT PANEL: CONFIG FORM */}
          <div className="lg:col-span-5" id="config-panel">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-6" id="input-card">
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-red-500" />
                  Thiết lập Thông số Video
                </h3>
                <span className="text-xs bg-red-50 text-red-650 font-bold px-2.5 py-1 rounded border border-red-100">
                  {duration} giây
                </span>
              </div>

              <form onSubmit={handleGenerate} className="space-y-5" id="generator-form">
                
                {/* Product Target */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    Sản phẩm / Thương hiệu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="product-input"
                      value={product}
                      onChange={(e) => setProduct(e.target.value)}
                      placeholder="Mã sản phẩm hoặc thương hiệu (ví dụ: BinhChuaChayBQP_4kg)"
                      className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-150 rounded-xl p-3 text-sm focus:outline-none placeholder-slate-400 font-medium"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Hệ thống sẽ tự động chuyển tên thành @tag để AI tiện theo dõi.
                  </p>
                </div>

                {/* Duration Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    Tổng thời lượng video <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="duration-select"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 rounded-xl p-3 text-sm font-medium focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value={20}>20 giây (2 phân cảnh / 2 prompt 10s)</option>
                      <option value={30}>30 giây (3 phân cảnh / 3 prompt 10s)</option>
                      <option value={40}>40 giây (4 phân cảnh / 4 prompt 10s)</option>
                      <option value={50}>50 giây (5 phân cảnh / 5 prompt 10s)</option>
                      <option value={60}>60 giây (6 phân cảnh / 6 prompt 10s)</option>
                    </select>
                    <span className="absolute right-4 top-3.5 pointer-events-none text-slate-400 text-xs">▼</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Luôn chia đều ra mỗi phân cảnh là đúng 10 giây đồng nhất.
                  </p>
                </div>

                {/* Main Idea */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Ý tưởng chính của câu chuyện <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="idea-input"
                    rows={4}
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="Mô tả cốt truyện thô của bạn. Ví dụ: Loan giới thiệu cho Ngọc về bình chữa cháy uy tín của Bộ Quốc phòng có tem QR kiểm tra..."
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-150 rounded-xl p-3 text-sm focus:outline-none placeholder-slate-400 font-medium"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Mô tả súc tích, tóm tắt mâu thuẫn hoặc giải pháp bạn mong muốn.
                  </p>
                </div>

                {/* Grid for Characters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      🧑 Nhân vật 1 (Nam)
                    </label>
                    <input
                      type="text"
                      id="char1-input"
                      value={char1}
                      onChange={(e) => setChar1(e.target.value)}
                      placeholder="Ngọc (Nam - lịch lãm)"
                      className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-150 rounded-xl p-3 text-sm focus:outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      👩 Nhân vật 2 (Nữ)
                    </label>
                    <input
                      type="text"
                      id="char2-input"
                      value={char2}
                      onChange={(e) => setChar2(e.target.value)}
                      placeholder="Loan (Nữ - cá tính)"
                      className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-150 rounded-xl p-3 text-sm focus:outline-none font-medium"
                    />
                  </div>
                </div>

                {/* Tone Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Hành văn / Biểu cảm
                  </label>
                  <div className="relative">
                    <select
                      id="tone-select"
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 rounded-xl p-3 text-sm font-medium focus:outline-none appearance-none"
                    >
                      <option value="Ngắn gọn, súc tích, Gen Z, thực tế">Gen Z Độc Lạ, Vừa Hài Vừa Cuốn</option>
                      <option value="Tư vấn, rõ ràng, rành mạch, bảo hành uy tín">Uy Tín Chuyên Nghiệp (Báo cáo/Tư vấn)</option>
                      <option value="Tranh luận, kịch tính, bất ngờ lật mặt">Kịch Tính Thuyết Phục (Sốc/Drama)</option>
                      <option value="Đọc chậm rãi, tự sự, chân thật, sâu lắng">Tâm Sự Sâu Sắc, Thấu Hiểu</option>
                    </select>
                    <span className="absolute right-4 top-3.5 pointer-events-none text-slate-400 text-xs">▼</span>
                  </div>
                </div>

                {/* Camera & Background context */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Bối cảnh quay phim
                  </label>
                  <input
                    type="text"
                    id="background-input"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    placeholder="Ví dụ: @Showroom_PCCC, @PhongKhachGenz sang trọng"
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-150 rounded-xl p-3 text-sm focus:outline-none font-medium"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Gợi ý gắn tag @ để các AI Camera Generator giữ bối cảnh cố định.
                  </p>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  id="generate-submit-btn"
                  disabled={isLoading || !product.trim() || !idea.trim()}
                  className={`w-full py-4 rounded-xl font-bold text-shadow transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-550/20 ${
                    isLoading || !product.trim() || !idea.trim()
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white transform hover:-translate-y-0.5 active:translate-y-0"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Đang Biên Soạn Kịch Bản...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 fill-current" />
                      Tạo Kịch Bản Video Ngắn
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT PANEL: DISPLAY SCRIPT */}
          <div className="lg:col-span-7" id="output-panel">
            
            {/* ERROR DISPLAY */}
            {error && (
              <div 
                className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-2xl mb-6 flex items-start gap-3" 
                id="error-banner"
              >
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Gặp lỗi biên soạn kịch bản</h4>
                  <p className="text-xs text-red-700 mt-1">{error}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Lực lượng kịch bản AI yêu cầu khóa API hoạt động. Hãy chắc chắn rằng bạn đã cấu hình <strong className="text-slate-800">GEMINI_API_KEY</strong> trong menu Settings &gt; Secrets.
                  </p>
                </div>
              </div>
            )}

            {/* EMPTY STATE */}
            {!isLoading && !result && !error && (
              <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[500px]" id="empty-state">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4" id="empty-icon-wrap">
                  <Video className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-950 text-lg">Chưa Có Kịch Bản Được Tạo</h4>
                <p className="text-slate-500 text-sm max-w-sm mt-2">
                  Điền các thông tin sản phẩm và ý tưởng thô ở khung bên trái hoặc lựa chọn một mẫu thử nghiệm nhanh để AI thực hiện biên soạn.
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200/60 font-medium">
                  <PlayCircle className="w-4 h-4 text-slate-400" />
                  Hỗ trợ phân rã 4 cảnh 10 giây đều đặn
                </div>
              </div>
            )}

            {/* LOADING STATE */}
            {isLoading && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 text-center shadow-sm min-h-[500px] flex flex-col items-center justify-center" id="loading-state">
                <div className="relative mb-8" id="loading-spinner-wrap">
                  <div className="w-20 h-20 border-4 border-red-500/10 border-t-red-600 rounded-full animate-spin" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-600">
                    <Sparkles className="w-8 h-8 animate-pulse" />
                  </div>
                </div>
                
                <h4 className="font-bold text-slate-900 text-lg mb-4">Đang Khởi Tạo Ý Tưởng Nghệ Thuật</h4>
                
                <div className="w-full max-w-xs bg-slate-100 rounded-full h-2 mb-6 overflow-hidden">
                  <motion.div 
                    className="bg-red-600 h-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${((loadingStep + 1) / stepsList.length) * 100}%` }}
                    transition={{ duration: 1.5 }}
                  />
                </div>

                {/* Scrolling loading step messages */}
                <div className="h-6 overflow-hidden max-w-md w-full" id="loading-text-container">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={loadingStep}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-sm font-semibold text-red-600"
                    >
                      {stepsList[loadingStep]}
                    </motion.p>
                  </AnimatePresence>
                </div>
                
                <p className="text-slate-400 text-xs mt-3">Quá trình này sử dụng AI chất lượng cao để viết hội thoại mượt mà nhất.</p>
              </div>
            )}

            {/* RESULTS STATE */}
            {result && !isLoading && (
              <div className="space-y-6" id="results-view">
                
                {/* Header title block */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm" id="result-header-block">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
                    <span className="inline-flex items-center gap-1.5 text-xs bg-red-50 text-red-700 font-semibold px-2.5 py-1 rounded-full border border-red-100">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                      Tiêu Đề Video Cho TikTok / Reels
                    </span>
                    <button
                      onClick={() => copyText(getFullFormattedText(), "all")}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 font-medium cursor-pointer ${
                        copiedAll 
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800 scale-95" 
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                      }`}
                      id="copy-all-btn"
                    >
                      {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedAll ? "Đã sao chép kịch bản!" : "Sao chép toàn bộ kịch bản"}
                    </button>
                  </div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug" id="result-title">
                    {result.title}
                  </h2>
                </div>

                {/* Section 1: Kịch bản tổng thể */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm" id="result-summary-block">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-500" />
                      Phần 1: Kịch bản tổng thể
                    </h3>
                    <button
                      onClick={() => copyText(result.generalSummary, "summary")}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-50 transition-colors"
                      title="Sao chép kịch bản tổng thể"
                      id="copy-summary-btn"
                    >
                      {copiedSummary ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-700 text-sm leading-relaxed whitespace-pre-line font-medium" id="summary-content">
                    {result.generalSummary}
                  </div>
                </div>

                {/* Section 2: Split prompts */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="result-detail-block">
                  
                  {/* Section Title & Info */}
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                          <Clock className="w-4 h-4 text-red-500" />
                          Phần 2: Kịch bản {result.scenes.length * 10}s ({result.scenes.length} phân cảnh - Mỗi prompt 10s đồng nhất)
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Copy từng Prompt dán riêng vào AI sinh video để có dải cảnh khớp đồng nhất nhân vật.
                        </p>
                      </div>
                    </div>

                    {/* Scene Tab Selectors */}
                    <div className="flex flex-wrap gap-2 mt-4" id="scenes-tabs">
                      {result.scenes.map((s) => (
                        <button
                          key={s.id}
                          id={`tab-btn-${s.id}`}
                          onClick={() => setActiveSceneTab(s.id)}
                          className={`py-3 px-2 rounded-xl text-center border transition-all cursor-pointer flex flex-col justify-center items-center flex-1 min-w-[80px] ${
                            activeSceneTab === s.id
                              ? "bg-red-600 border-red-600 text-white shadow-md shadow-red-600/10"
                              : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                          }`}
                        >
                          <span className="text-xs font-bold block uppercase tracking-wide">Cảnh {s.id}</span>
                          <span className={`text-[10px] block mt-0.5 ${activeSceneTab === s.id ? "text-red-100" : "text-slate-400"}`}>
                            {s.timeRange}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Scene Content */}
                  <div className="p-6" id="scene-active-content-wrap">
                    {result.scenes.map((s) => {
                      if (s.id !== activeSceneTab) return null;
                      return (
                        <div key={s.id} className="space-y-5" id={`scene-details-${s.id}`}>
                          
                          {/* Top metadata cards */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* Actor tagging */}
                            <div className="bg-rose-50/45 border border-rose-100/60 rounded-xl p-3.5">
                              <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                                <User className="w-3 h-3 text-rose-500" />
                                Tags Nhân vật
                              </span>
                              <p className="text-xs text-rose-950 font-semibold">{s.characters}</p>
                            </div>

                            {/* Background Details */}
                            <div className="bg-sky-50/45 border border-sky-100/60 rounded-xl p-3.5">
                              <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                                <Video className="w-3 h-3 text-sky-500" />
                                Bối cảnh & Máy quay
                              </span>
                              <p className="text-xs text-sky-950 font-semibold">{s.settingAndCamera}</p>
                            </div>

                          </div>

                          {/* Dialogue Area */}
                          <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
                              Lời thoại & Biên kịch chi tiết
                            </span>
                            <div className="text-slate-800 text-sm whitespace-pre-line font-medium leading-relaxed">
                              {/* Highlight Loan/Ngọc colors dynamically if possible */}
                              {s.dialogue.split("\n").map((line, idx) => {
                                const isNgoc = line.startsWith("Ngọc:") || line.startsWith("Nam:");
                                const isLoan = line.startsWith("Loan:") || line.startsWith("Nữ:");
                                
                                return (
                                  <div 
                                    key={idx} 
                                    className={`py-1.5 px-2 rounded-lg my-1 ${
                                      isNgoc ? "bg-rose-50/70 border-l-2 border-rose-500" : 
                                      isLoan ? "bg-blue-50/70 border-l-2 border-blue-500" : ""
                                    }`}
                                  >
                                    {line}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* RAW PROMPT FOR AI GENERATOR COPY */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-red-600 block uppercase tracking-wide">
                                Prompt sinh video AI chuyên nghiệp (Copy)
                              </span>
                              <button
                                onClick={() => copyText(s.rawPrompt, "scene", s.id)}
                                className={`text-xs px-2.5 py-1 rounded-md border shadow-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                                  copiedSceneId === s.id
                                    ? "bg-emerald-600 border-emerald-600 text-white"
                                    : "bg-red-50 hover:bg-red-100 border-red-200 text-red-600"
                                }`}
                                id={`copy-prompt-btn-${s.id}`}
                              >
                                {copiedSceneId === s.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    Đã chép prompt!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    Sao chép Prompt Cảnh {s.id}
                                  </>
                                )}
                              </button>
                            </div>
                            
                            <textarea
                              readOnly
                              id={`raw-prompt-textarea-${s.id}`}
                              value={s.rawPrompt}
                              rows={5}
                              className="w-full bg-slate-900 text-slate-100 font-mono text-xs rounded-xl p-3.5 border border-slate-800 shadow-inner focus:outline-none leading-relaxed resize-none"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">
                              * Prompt này gom đủ thông tin nhân vật, định hướng bối cảnh cụ thể và text lời thoại để AI dễ bóc tách và sinh khớp mặt nhất.
                            </p>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Conclusion & CTA */}
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-orange-100 p-6 rounded-2xl shadow-sm" id="result-conclusion-block">
                  <h3 className="font-bold text-orange-950 text-sm uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Smile className="w-4 h-4 text-orange-600" />
                    Kêu gọi hành động (Kết bài CTA cho video)
                  </h3>
                  <p className="text-orange-900 text-sm leading-relaxed font-semibold">
                    {result.conclusion}
                  </p>
                </div>

              </div>
            )}

          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 mt-16 text-center text-slate-400 text-xs" id="app-footer">
        <p className="font-medium">AI Biên Kịch Video Ngắn © 2026 • Sinh kịch bản thông minh bằng mô hình GPT/Gemini-3.5</p>
        <p className="mt-1">Dành cho các nhà sản xuất nội dung TikTok, Instagram Reels, Youtube Shorts.</p>
      </footer>
    </div>
  );
}
