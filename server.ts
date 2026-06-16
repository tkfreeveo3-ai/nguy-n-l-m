import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      throw new Error("GEMINI_API_KEY chưa được cấu hình. Vui lòng thêm vào tab Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API endpoint to generate the video script
app.post("/api/generate", async (req, res) => {
  try {
    const { product, idea, char1, char2, tone, background, duration } = req.body;

    if (!product || !idea) {
      return res.status(400).json({ error: "Thiếu thông tin Sản phẩm hoặc Ý tưởng chính." });
    }

    const client = getGeminiClient();

    // Setup input defaults & duration math
    const character1 = char1 || "Ngọc (Nam - lịch lãm)";
    const character2 = char2 || "Loan (Nữ - năng động)";
    const scriptTone = tone || "Ngắn gọn, súc tích, Gen Z, thực tế";
    const bgContext = background || "Showroom hoặc bối cảnh hiện đại";
    
    const parsedDuration = parseInt(duration, 10) || 40;
    const numScenes = Math.max(2, Math.min(6, Math.floor(parsedDuration / 10))); // clamp between 2 and 6 scenes (20s - 60s)
    const actualDuration = numScenes * 10;
    
    // Create random seed to force absolute variety and disable LLM caching behavior
    const randomSeedStr = Math.floor(Math.random() * 9999999).toString();

    // System instructions to enforce the strict requirements
    const systemInstruction = `Bạn là một siêu biên kịch video ngắn (TikTok/Reels/Shorts) xuất sắc tại Việt Nam.
Nhiệm vụ của bạn là nhận thông tin ý tưởng và sản phẩm của người dùng để viết ra kịch bản hoàn chỉnh, cực kỳ cuốn hút, giữ chân người xem.

QUY TẮC ĐẶC BIỆT ĐỂ KHÔNG BỊ TRÙNG LẶP SÁO RỖNG (MỖI LẦN LÀ MỘT Ý TƯỞNG MỚI):
1. Mỗi kịch bản được tạo ra phải khác biệt hoàn toàn về cách bộc lộ tình huống, bắt đầu hội thoại, nhịp độ và cấu trúc mâu thuẫn. Ví dụ, nếu lần trước là giải thích, lần này có thể là: Thách đố, troll nhau hài hước, drama lật mặt đột ngột, trò chuyện hiểu lầm, hoặc cùng đối chiếu nỗi đau khách hàng theo trend Gen Z độc lạ.
2. Tuyệt đối KHÔNG viết theo một lối mòn rập khuôn sương sương sếp và nhân viên giảng giải thông thường. Hãy phong phú cốt truyện, đẩy cao sự tươi mới, độc đáo bộc phá đúng chất Gen Z!
3. Tuyệt đối KHÔNG được viết tắt bất kỳ từ nào (ví dụ: viết rõ "Phòng cháy chữa cháy" thay vì "PCCC", "Bộ Quốc Phòng" thay vì "BQP", "giây" thay vì "s", "mã QR" thay vì "QR").

QUY TẮC CẤU TRÚC:
1. TIÊU ĐỀ: Phải vô cùng giật tít, tò mò, tạo Hook cực mạnh trong 3 giây đầu để người dùng không lướt qua.
2. PHẦN 1: KỊCH BẢN TỔNG THỂ: Tóm tắt cực kỳ ngắn gọn diễn biến câu chuyện (đóng vai trò dẫn dắt).
3. PHẦN 2: KỊCH BẢN CHI TIẾT ${actualDuration} GIÂY KHỚP CHÍNH XÁC ${numScenes} PROMPT ĐỒNG NHẤT:
   - Chia kịch bản dài chính xác thành ${numScenes} phân cảnh, mỗi phân cảnh tương ứng với đúng 10 giây (ví dụ: cảnh 1 là 0s-10s, cảnh 2 là 10s-20s, v.v.).
   - Mỗi phân cảnh PHẢI có cấu trúc đồng nhất để người dùng thuận tiện dán làm PROMPT vào các AI sinh video:
     - Nhân vật: Có gắn thẻ @ vào tên nhân vật (Ví dụ: @Ngọc (Nam - lịch lãm), @Loan (Nữ - năng động)).
     - Bối cảnh/Góc máy: Có gắn thẻ @ vào tên bối cảnh và sản phẩm (Ví dụ: @Showroom_PhongChayChuaChay, @BinhChuaChayBoQuocPhong_4kg). Có đa dạng góc máy (Toàn cảnh, Trung cảnh, Cận cảnh/Macro, chuyển động máy quay sáng tạo) phù hợp với phân tích chi tiết.
     - Lời thoại/Lời bình: Phải ngắn, tự nhiên, mang hơi thở Gen Z thực tế, bỏ hẳn kiểu văn văn AI công nghiệp.
     - TRƯỜNG "rawPrompt" PHẢI ĐƯỢC GHÉP CHÍNH XÁC THEO ĐÚNG ĐỊNH DẠNG SAU ĐÂY (KHÔNG ĐƯỢC THIẾU BẤT KỲ DÒNG NÀO):
       Nhân vật: @Ngọc (Nam - lịch lãm), @Loan (Nữ - năng động).
       Bối cảnh/Góc máy: @Showroom_PhongChayChuaChay ánh sáng cinematic, tone màu đỏ - trắng chủ đạo. Góc máy [Toàn cảnh] trượt mượt (Wide slider) theo bước chân của @Ngọc và @Loan
       Lời thoại:
       Ngọc: "Bên anh làm kho xưởng, em xem có dòng nào 'gánh' được sự an toàn mà không phải lo nghĩ không?"
       Loan: "Đã làm doanh nghiệp thì cứ 'hàng hiệu' Bộ Quốc Phòng mà đi thôi anh!"

       (Hãy thay thế và thay đổi nội dung phù hợp cho từng cảnh, nhưng cấu trúc 3 phần và các tiêu đề "Nhân vật:", "Bối cảnh/Góc máy:", "Lời thoại:" PHẢI GIỮ NGUYÊN 100% để dễ copy).
4. KẾT BÀI (CTA): Kêu gọi hành động ngắn gọn, kích thích bình luận hoặc bấm follow.`;

    const promptText = `Hãy tạo một kịch bản mới hoàn toàn, độc đáo, sáng tạo bứt phá và không trùng lặp các lối nói cũ!
- Mã sáng tạo ngẫu nhiên (ép buộc thay đổi giọng văn): creative_rand_${randomSeedStr}
- Tổng thời lượng video: ${actualDuration} giây
- Số lượng phân cảnh yêu cầu: Đúng ${numScenes} phân cảnh (Mỗi cảnh dài 10 giây)
- Sản phẩm/Thương hiệu cần quảng cáo: ${product} (Gắn tag dạng @ tên sản phẩm viết liền không dấu, ví dụ: @BinhChuaChayBoQuocPhong_4kg, @SonMoiAnAn_01...)
- Ý tưởng cốt truyện thô: ${idea}
- Nhân vật 1: ${character1} (Luôn giữ tên @Ngọc và giới tính/phong cách phù hợp)
- Nhân vật 2: ${character2} (Luôn giữ tên @Loan và giới tính/phong cách phù hợp)
- Phong cách giọng điệu/Tone: ${scriptTone}
- Bối cảnh chung: ${bgContext} (Gắn tag dạng @ tên bối cảnh viết liền không dấu, ví dụ: @Showroom_PhongChayChuaChay, @PhongKhachGenz...)

Yêu cầu xuất ra cấu trúc JSON chính xác theo Schema quy định.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 1.15, // High temperature to give a lot of fun, GenZ variety on recalculations!
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "Tiêu đề giật tít kích thích sự tò mò (Hook trong 3 giây đầu)"
            },
            generalSummary: {
              type: Type.STRING,
              description: "Tóm tắt ngắn gọn diễn biến câu chuyện toàn bộ (Phần 1)"
            },
            scenes: {
              type: Type.ARRAY,
              description: "Danh sách các phân cảnh tuần tự của kịch bản, mỗi phân cảnh dài đúng 10 giây",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: {
                    type: Type.INTEGER,
                    description: "Số thứ tự phân cảnh (bắt đầu từ 1)"
                  },
                  timeRange: {
                    type: Type.STRING,
                    description: "Thời lượng phân cảnh, ví dụ: '0s - 10s', '10s - 20s'"
                  },
                  characters: {
                    type: Type.STRING,
                    description: "Khai báo nhân vật, ví dụ: 'Nhân vật: @Ngọc (Nam - lịch lãm), @Loan (Nữ - năng động).'"
                  },
                  settingAndCamera: {
                    type: Type.STRING,
                    description: "Bối cảnh và góc máy chi tiết, ví dụ: 'Bối cảnh/Góc máy: @Showroom_PhongChayChuaChay ánh sáng cinematic...'"
                  },
                  dialogue: {
                    type: Type.STRING,
                    description: "Lời thoại của nhân vật, ví dụ: 'Lời thoại:\nNgọc: \"...\"\nLoan: \"...\"'"
                  },
                  rawPrompt: {
                    type: Type.STRING,
                    description: "Tổng hợp prompt hoàn chỉnh của cảnh này, bắt buộc gồm 3 phần đầy đủ viết rõ ràng từng tiêu đề: 'Nhân vật: ...\\nBối cảnh/Góc máy: ...\\nLời thoại:\\nNgọc: \"...\"\\nLoan: \"...\"'"
                  }
                },
                required: ["id", "timeRange", "characters", "settingAndCamera", "dialogue", "rawPrompt"]
              }
            },
            conclusion: {
              type: Type.STRING,
              description: "Kêu gọi hành động ngắn gọn (CTA), khuyên comment hoặc follow"
            }
          },
          required: ["title", "generalSummary", "scenes", "conclusion"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Không nhận được phản hồi từ AI.");
    }

    try {
      const parsedData = JSON.parse(resultText.trim());
      return res.json(parsedData);
    } catch (parseError) {
      console.error("Lỗi parse JSON:", resultText);
      return res.status(500).json({ error: "Lỗi cấu trúc phản hồi AI.", rawText: resultText });
    }

  } catch (error: any) {
    console.error("Lỗi backend:", error);
    return res.status(500).json({ error: error.message || "Đã xảy ra lỗi không xác định." });
  }
});

// Configure Vite middleware in development or serve static build in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
