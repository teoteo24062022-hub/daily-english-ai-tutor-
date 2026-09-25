import json
import re
import time
from pathlib import Path
from datetime import datetime
import httpx

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
OUTPUT_FILE = DATA_DIR / "vocabulary.json"

TECH_AI_B2_WORDS = [
    {
        "word": "trade-off",
        "ipa": "/ˈtreɪd.ɑːf/",
        "pos": "noun",
        "level": "B2-Tech",
        "meaning": "sự đánh đổi giữa hai yếu tố mâu thuẫn (như độ trễ và độ chính xác)",
        "example_en": "There is always a trade-off between model latency and inference accuracy.",
        "example_vi": "Luôn có sự đánh đổi giữa độ trễ của mô hình và độ chính xác suy luận.",
        "mnemonic": "Trade (trao đổi) + Off -> Để được cái này ta phải chấp nhận hy sinh bớt cái kia."
    },
    {
        "word": "bottleneck",
        "ipa": "/ˈbɑː.t̬əl.nek/",
        "pos": "noun",
        "level": "B2-Tech",
        "meaning": "điểm nghẽn cổ chai (nơi gây chậm trễ cho cả hệ thống)",
        "example_en": "Database I/O operations are the main bottleneck in our data pipeline.",
        "example_vi": "Các thao tác đọc ghi cơ sở dữ liệu là điểm nghẽn chính trong đường ống dữ liệu.",
        "mnemonic": "Cổ chai (bottle neck) bị thắt hẹp lại khiến dòng nước/dữ liệu chảy chậm."
    },
    {
        "word": "scalability",
        "ipa": "/ˌskeɪ.ləˈbɪl.ə.t̬i/",
        "pos": "noun",
        "level": "B2-Tech",
        "meaning": "khả năng mở rộng quy mô tải lớn",
        "example_en": "Our architecture ensures high scalability as user traffic increases ten-fold.",
        "example_vi": "Kiến trúc của chúng tôi đảm bảo khả năng mở rộng cao khi lượng truy cập tăng gấp 10 lần.",
        "mnemonic": "Scale (thước đo quy mô) + ability (khả năng) -> Khả năng mở rộng quy mô."
    },
    {
        "word": "mitigate",
        "ipa": "/ˈmɪt̬.ə.ɡeɪt/",
        "pos": "verb",
        "level": "B2-Work",
        "meaning": "giảm thiểu mức độ nghiêm trọng hoặc rủi ro",
        "example_en": "We deployed a rate limiter to mitigate denial-of-service risks.",
        "example_vi": "Chúng tôi triển khai bộ giới hạn tốc độ để giảm thiểu rủi ro bị từ chối dịch vụ.",
        "mnemonic": "Mitigate = làm dịu, giảm thiểu nhẹ đi tác động xấu."
    },
    {
        "word": "post-mortem",
        "ipa": "/ˌpoʊstˈmɔːr.t̬əm/",
        "pos": "noun",
        "level": "B2-Work",
        "meaning": "báo cáo mổ xẻ phân tích nguyên nhân gốc rễ sau sự cố (RCA)",
        "example_en": "We conducted a blameless post-mortem after the production outage.",
        "example_vi": "Chúng tôi đã thực hiện một buổi mổ xẻ sự cố không chỉ trích sau đợt gián đoạn hệ thống.",
        "mnemonic": "Post (sau) + Mortem (cái chết) -> Phân tích sau khi sự cố diễn ra để không lặp lại."
    },
    {
        "word": "asynchronous",
        "ipa": "/eɪˈsɪŋ.krə.nəs/",
        "pos": "adjective",
        "level": "B2-Tech",
        "meaning": "bất đồng bộ (không bắt các tiến trình phải chờ đợi nhau)",
        "example_en": "Using asynchronous requests prevented the user interface from freezing.",
        "example_vi": "Sử dụng các yêu cầu bất đồng bộ đã ngăn giao diện người dùng bị đơ.",
        "mnemonic": "A- (phủ định) + Synch (đồng bộ) -> Không cần chờ đợi đồng bộ."
    },
    {
        "word": "robust",
        "ipa": "/roʊˈbʌst/",
        "pos": "adjective",
        "level": "B2-Tech",
        "meaning": "mạnh mẽ, bền bỉ, chịu lỗi cao",
        "example_en": "We need a more robust exception handling mechanism for edge cases.",
        "example_vi": "Chúng ta cần cơ chế xử lý ngoại lệ mạnh mẽ hơn cho các trường hợp biên.",
        "mnemonic": "Robot -> Robust: bền bỉ như robot kim loại."
    },
    {
        "word": "fine-tune",
        "ipa": "/ˌfaɪnˈtuːn/",
        "pos": "verb",
        "level": "B2-AI",
        "meaning": "tinh chỉnh mô hình AI trên dữ liệu đặc thù",
        "example_en": "We plan to fine-tune the open-source LLM on our internal documentation.",
        "example_vi": "Chúng tôi dự định tinh chỉnh mô hình LLM mã nguồn mở trên tài liệu nội bộ.",
        "mnemonic": "Fine (tinh tế) + Tune (chỉnh âm) -> Tinh chỉnh cho hoàn hảo."
    },
    {
        "word": "redundancy",
        "ipa": "/rɪˈdʌn.dən.si/",
        "pos": "noun",
        "level": "B2-Tech",
        "meaning": "sự dự phòng hệ thống (để khi 1 server sập vẫn có server thay thế)",
        "example_en": "We built multi-region redundancy to guarantee 99.99 percent uptime.",
        "example_vi": "Chúng tôi xây dựng dự phòng đa khu vực để bảo đảm hệ thống hoạt động 99.99%.",
        "mnemonic": "Redundant trong đời sống là dư thừa, nhưng trong Tech là tính dự phòng cứu cánh."
    },
    {
        "word": "deprecated",
        "ipa": "/ˈdep.rə.keɪ.t̬ɪd/",
        "pos": "adjective",
        "level": "B2-Tech",
        "meaning": "đã lỗi thời, không còn được khuyến khích sử dụng",
        "example_en": "This API endpoint is deprecated and will be removed in version 2.0.",
        "example_vi": "Endpoint API này đã lỗi thời và sẽ bị xóa trong phiên bản 2.0.",
        "mnemonic": "De- (hạ xuống) + Preciate -> Giảm giá trị, khuyên không nên dùng nữa."
    },
    {
        "word": "latency",
        "ipa": "/ˈleɪ.tən.si/",
        "pos": "noun",
        "level": "B2-AI",
        "meaning": "độ trễ (thời gian phản hồi của model/hệ thống)",
        "example_en": "We must reduce model inference latency under 200 milliseconds.",
        "example_vi": "Chúng ta phải giảm độ trễ suy luận của mô hình xuống dưới 200 mili-giây.",
        "mnemonic": "Bắt nguồn từ gốc 'late' (muộn, trễ)."
    },
    {
        "word": "throughput",
        "ipa": "/ˈθruː.pʊt/",
        "pos": "noun",
        "level": "B2-Tech",
        "meaning": "lưu lượng xử lý (số lượng request hoặc token trên mỗi giây)",
        "example_en": "Our batching strategy doubled the model throughput without losing accuracy.",
        "example_vi": "Chiến lược gom nhóm của chúng tôi đã tăng gấp đôi lưu lượng xử lý mà không giảm độ chính xác.",
        "mnemonic": "Through (xuyên qua) + Put (đặt) -> Lượng dữ liệu đi xuyên suốt qua hệ thống."
    },
    {
        "word": "benchmark",
        "ipa": "/ˈbentʃ.mɑːrk/",
        "pos": "noun",
        "level": "B2-Tech",
        "meaning": "bài kiểm chuẩn đối sánh hiệu năng hệ thống",
        "example_en": "The new algorithm outperformed existing benchmarks on GPU clusters.",
        "example_vi": "Thuật toán mới vượt trội hơn các bài kiểm chuẩn hiện có trên cụm máy chủ GPU.",
        "mnemonic": "Bench (bàn thí nghiệm) + Mark (vạch dấu) -> Vạch chuẩn đối sánh."
    },
    {
        "word": "orchestration",
        "ipa": "/ˌɔːr.kəˈstreɪ.ʃən/",
        "pos": "noun",
        "level": "B2-Tech",
        "meaning": "sự điều phối tự động hóa các dịch vụ hoặc container phức tạp",
        "example_en": "Kubernetes provides robust orchestration for containerized microservices.",
        "example_vi": "Kubernetes cung cấp khả năng điều phối mạnh mẽ cho các dịch vụ vi mô đóng gói container.",
        "mnemonic": "Orchestra (dàn nhạc giao hưởng) -> Điều phối nhịp nhàng các dịch vụ như nhạc trưởng."
    },
    {
        "word": "refactor",
        "ipa": "/riːˈfæk.tɚ/",
        "pos": "verb",
        "level": "B2-Tech",
        "meaning": "tái cấu trúc mã nguồn để tối ưu mà không làm thay đổi hành vi bên ngoài",
        "example_en": "We should refactor the data loader to prevent redundant memory allocations.",
        "example_vi": "Chúng ta nên tái cấu trúc bộ nạp dữ liệu để ngăn việc cấp phát bộ nhớ thừa thãi.",
        "mnemonic": "Re (làm lại) + Factor (yếu tố cấu thành) -> Tái cấu trúc bên trong."
    }
]

def clean_vietnamese_meaning(raw: str) -> str:
    # Clean leading dashes, colons, numbers, trailing notes
    s = raw.strip()
    s = re.sub(r'^[-\*\+\s]+', '', s)
    s = re.sub(r'^\([^\)]+\)\s*', '', s)  # remove (thông tục), etc.
    s = s.split(';')[0].strip()
    s = s.split(',')[0].strip()
    return s

def parse_dict(text: str):
    print("Parsing English-Vietnamese dictionary text...")
    entries = {}
    current_word = None
    current_ipa = ""
    current_pos = "noun"
    meanings = []
    examples = []

    def save_current():
        nonlocal current_word, current_ipa, current_pos, meanings, examples
        if current_word and meanings:
            w_lower = current_word.lower()
            if w_lower not in entries:
                entries[w_lower] = {
                    "word": current_word,
                    "ipa": current_ipa,
                    "pos": current_pos,
                    "meanings": meanings[:3],
                    "examples": examples[:2]
                }
        current_word = None
        current_ipa = ""
        current_pos = "noun"
        meanings = []
        examples = []

    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        if line.startswith('@'):
            save_current()
            parts = line[1:].split('/')
            current_word = parts[0].strip()
            if len(parts) > 1:
                current_ipa = f"/{parts[1].strip()}/"
        elif line.startswith('*'):
            pos_line = line[1:].strip().lower()
            if 'danh' in pos_line:
                current_pos = "noun"
            elif 'động' in pos_line:
                current_pos = "verb"
            elif 'tính' in pos_line:
                current_pos = "adjective"
            elif 'phó' in pos_line or 'trạng' in pos_line:
                current_pos = "adverb"
            elif 'giới' in pos_line:
                current_pos = "preposition"
            elif 'liên' in pos_line:
                current_pos = "conjunction"
        elif line.startswith('-'):
            m = clean_vietnamese_meaning(line[1:])
            if m and len(m) > 1 and m not in meanings:
                meanings.append(m)
        elif line.startswith('='):
            # Example: =a cup+ cái chén
            if '+' in line:
                en_part, vi_part = line[1:].split('+', 1)
                en_clean = en_part.strip()
                vi_clean = vi_part.strip()
                if en_clean and vi_clean:
                    examples.append((en_clean, vi_clean))

    save_current()
    print(f"Parsed {len(entries)} words in dictionary lookup table.")
    return entries

def main():
    start_time = time.time()
    today_str = datetime.now().strftime("%Y-%m-%d")

    print("Step 1: Downloading Oxford vocabulary dataset (10,674 words)...")
    oxford_url = "https://raw.githubusercontent.com/Gamezxz/flashcard/main/data/vocabulary.json"
    resp_oxford = httpx.get(oxford_url, timeout=30.0, follow_redirects=True)
    oxford_data = resp_oxford.json()

    print("Step 2: Downloading English-Vietnamese dictionary dataset...")
    dict_url = "https://raw.githubusercontent.com/manhminno/English-Vietnamese-Dictionary/master/data/english-vietnamese.txt"
    resp_dict = httpx.get(dict_url, timeout=45.0, follow_redirects=True)
    dict_lookup = parse_dict(resp_dict.text)

    print("Step 3: Selecting and organizing exactly 4,000 words across A1 to B2...")

    # Group oxford words by CEFR level
    by_level = {"A1": [], "A2": [], "B1": [], "B2": []}
    for item in oxford_data:
        lvl = item.get("level", "").upper()
        word = item.get("word", "").strip()
        if lvl in by_level and word and len(word) >= 2 and not word.isdigit():
            # Check not already in list
            if not any(w["word"].lower() == word.lower() for w in by_level[lvl]):
                by_level[lvl].append(item)

    print(f"Available Oxford counts -> A1: {len(by_level['A1'])}, A2: {len(by_level['A2'])}, B1: {len(by_level['B1'])}, B2: {len(by_level['B2'])}")

    # Target counts:
    # A1: 1000 words
    # A2: 1000 words
    # B1: 1000 words
    # B2: 1000 words
    # Total = 4,000 words
    targets = {
        "A1": 1000,
        "A2": 1000,
        "B1": 1000,
        "B2": 1000
    }

    final_list = []
    seen_words = set()

    # First add our curated Tech & AI B2 words
    for tw in TECH_AI_B2_WORDS:
        w_lower = tw["word"].lower()
        if w_lower not in seen_words:
            seen_words.add(w_lower)
            final_list.append({
                "id": f"v-{len(final_list)+1}",
                "word": tw["word"],
                "ipa": tw["ipa"],
                "part_of_speech": tw["pos"],
                "level": tw["level"],
                "meaning": tw["meaning"],
                "example_en": tw["example_en"],
                "example_vi": tw["example_vi"],
                "mnemonic": tw["mnemonic"],
                "srs_stage": 1,
                "next_review": today_str,
                "review_count": 0
            })

    # Helper to build word record
    def create_record(ox_item, target_level):
        w = ox_item.get("word", "").strip()
        w_lower = w.lower()

        # Look in dictionary
        dict_entry = dict_lookup.get(w_lower)

        # Meaning
        if dict_entry and dict_entry["meanings"]:
            meaning = ", ".join(dict_entry["meanings"][:2])
        elif ox_item.get("hint"):
            meaning = ox_item.get("hint")
        elif ox_item.get("definition"):
            meaning = ox_item.get("definition")
        else:
            meaning = f"Từ vựng cấp độ {target_level}: {w}"

        # IPA
        ipa = ""
        if dict_entry and dict_entry["ipa"]:
            ipa = dict_entry["ipa"]
        elif ox_item.get("ipa"):
            raw_ipa = ox_item.get("ipa").strip()
            ipa = f"/{raw_ipa}/" if not raw_ipa.startswith('/') else raw_ipa
        else:
            ipa = f"/{w_lower}/"

        # POS
        pos = ox_item.get("pos", "noun").replace('.', '').strip()
        if dict_entry and dict_entry["pos"]:
            pos = dict_entry["pos"]

        # Example EN & VI
        example_en = ""
        example_vi = ""
        if ox_item.get("examples") and len(ox_item["examples"]) > 0:
            ex_obj = ox_item["examples"][0]
            example_en = ex_obj.get("en", "").strip()
        
        if not example_en and dict_entry and dict_entry["examples"]:
            example_en, example_vi = dict_entry["examples"][0]

        if not example_en:
            example_en = f"You should practice using '{w}' in your daily English conversation."
            example_vi = f"Bạn nên luyện tập sử dụng từ '{w}' trong giao tiếp hằng ngày."
        elif not example_vi:
            example_vi = f"Ví dụ thực tế với từ '{w}'."

        # Mnemonic
        mnemonic = f"Luyện đọc to '{w}' 3 lần kèm phát âm chuẩn {ipa} và đặt câu thực tế."

        return {
            "id": f"v-{len(final_list)+1}",
            "word": w,
            "ipa": ipa,
            "part_of_speech": pos,
            "level": target_level,
            "meaning": meaning,
            "example_en": example_en,
            "example_vi": example_vi,
            "mnemonic": mnemonic,
            "srs_stage": 1,
            "next_review": today_str,
            "review_count": 0
        }

    # Add words level by level
    for lvl in ["A1", "A2", "B1", "B2"]:
        candidates = by_level[lvl]
        target_count = targets[lvl]
        added_for_level = 0

        # First pass: candidates with direct dictionary matches
        for c in candidates:
            if added_for_level >= target_count:
                break
            w = c["word"].strip().lower()
            if w in seen_words:
                continue
            if w in dict_lookup:
                seen_words.add(w)
                rec = create_record(c, lvl)
                final_list.append(rec)
                added_for_level += 1

        # Second pass: fill remaining
        for c in candidates:
            if added_for_level >= target_count:
                break
            w = c["word"].strip().lower()
            if w in seen_words:
                continue
            seen_words.add(w)
            rec = create_record(c, lvl)
            final_list.append(rec)
            added_for_level += 1

        print(f"Added {added_for_level} words for level {lvl}")

    # Total words check
    print(f"Total compiled words: {len(final_list)}")

    # Save to data/vocabulary.json
    print(f"Saving {len(final_list)} words to {OUTPUT_FILE}...")
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(final_list, f, ensure_ascii=False, indent=2)

    file_size_mb = OUTPUT_FILE.stat().st_size / (1024 * 1024)
    elapsed = time.time() - start_time
    print(f"SUCCESS: Created {OUTPUT_FILE.name} with {len(final_list)} vocabulary words ({file_size_mb:.2f} MB) in {elapsed:.2f} seconds!")

if __name__ == "__main__":
    main()
