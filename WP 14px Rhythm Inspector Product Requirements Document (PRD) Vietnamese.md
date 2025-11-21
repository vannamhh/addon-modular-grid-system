# **WP 14px Rhythm Inspector Product Requirements Document (PRD)**

## **1\. Goals and Background Context (Mục tiêu và Bối cảnh)**

### **1.1 Goals (Mục tiêu)**

* **Đảm bảo tính chính xác của nhịp điệu (Rhythm Precision):** Cung cấp cho các nhà phát triển WordPress khả năng kiểm tra căn chỉnh lưới 14px (dọc và ngang) trên các phần tử DOM cụ thể, giải quyết triệt để vấn đề lệch pha pixel.  
* **Trải nghiệm không xâm phạm (Non-intrusive UX):** Triển khai lớp phủ lưới (grid overlay) cho phép tương tác "click-through" hoàn toàn, đảm bảo người dùng có thể vừa kiểm tra lưới vừa thao tác với DevTools hoặc giao diện web mà không bị chặn.  
* **Đo lường thông minh (Smart Measurement):** Cung cấp công cụ đo độ lệch pixel (delta) theo yêu cầu (On-demand) để phát hiện các lỗi sai lệch nhỏ (1-2px) một cách nhanh chóng.  
* **Tối ưu hóa quy trình làm việc:** Loại bỏ sự xao nhãng thị giác bằng cách chỉ hiển thị lưới trên phần tử được chọn (Active Container) thay vì toàn màn hình.

### **1.2 Background Context (Bối cảnh)**

Trong phát triển giao diện web hiện đại, đặc biệt là với WordPress, các thành phần thường được thiết kế theo dạng mô-đun lồng nhau. Một vấn đề nhức nhối là "Global Grid Fallacy" (Ảo tưởng lưới toàn cục): một lưới 14px neo vào \<body\> thường sẽ bị lệch pha khi áp dụng cho một component con có tọa độ lẻ (ví dụ: top offset 13px), khiến việc kiểm tra "pixel-perfect" trở nên bất khả thi.

Ngoài ra, các công cụ hiện có thường chiếm quyền điều khiển chuột (blocking mouse events), buộc developer phải bật/tắt công cụ liên tục để tương tác với phần tử bên dưới. "WP 14px Rhythm Inspector" ra đời như một Extension nhẹ trên Chrome, sử dụng cơ chế "Local Square Grid" (Lưới vuông cục bộ) neo trực tiếp vào padding-box của phần tử, giúp developer duy trì nhịp điệu thiết kế mà không làm gián đoạn dòng chảy công việc (workflow).

### **1.3 Change Log**

| Date | Version | Description | Author |
| :---- | :---- | :---- | :---- |
| 2025-11-21 | 0.1 | Khởi tạo tài liệu từ Project Brief | John (PM) |
| 2025-11-21 | 0.2 | Thêm Requirements (Functional & Non-functional) | John (PM) |
| 2025-11-21 | 0.3 | Thêm User Interface Design Goals | John (PM) |
| 2025-11-21 | 0.4 | Thêm Technical Assumptions | John (PM) |
| 2025-11-21 | 0.5 | Thêm Epic List | John (PM) |
| 2025-11-21 | 0.6 | Thêm Epic 1 Details | John (PM) |
| 2025-11-21 | 0.7 | Thêm Epic 2 Details | John (PM) |
| 2025-11-21 | 1.0 | Hoàn tất Checklist & Next Steps | John (PM) |

## **2\. Requirements (Yêu cầu)**

### **2.1 Functional Requirements (Yêu cầu Chức năng)**

* **FR1 \- Targeted Activation (Kích hoạt theo mục tiêu):** Người dùng kích hoạt extension, di chuột để đánh dấu (highlight) các phần tử DOM. Khi nhấp vào một phần tử, lưới 14px sẽ được "neo" (pin) vào phần tử đó (Active Container) và reset gốc tọa độ (0,0) tại góc trên-trái của padding-box phần tử đó.  
* **FR2 \- Grid Visualization (Hiển thị lưới):** Lưới phải là các ô vuông 14px x 14px cố định. Đường kẻ rộng 1px, màu có độ tương phản cao (Cyan/Magenta) với độ mờ khoảng 30-50%. Lưới phải cuộn theo nội dung của phần tử (absolute positioning relative to container).  
* **FR3 \- Transparent Interaction (Tương tác xuyên thấu):** Lớp phủ lưới phải có thuộc tính CSS pointer-events: none. Mọi thao tác nhấp chuột, chọn văn bản, hoặc kéo thả phải đi xuyên qua lưới xuống phần tử web bên dưới.  
* **FR4 \- Smart Measurement Mode (Chế độ đo lường thông minh):** Khi giữ phím **Alt**, công cụ sẽ hiển thị khoảng cách (delta X/Y) từ con trỏ chuột hoặc mép phần tử đang hover đến dòng kẻ lưới gần nhất. Chế độ này tự động tắt khi nhả phím Alt.

### **2.2 Non-Functional Requirements (Yêu cầu Phi chức năng)**

* **NFR1 \- Performance (Hiệu năng):** Logic đo lường (Measurement logic) phải ở trạng thái nghỉ (idle) mặc định. Khi hoạt động (giữ phím Alt), các trình xử lý sự kiện mousemove phải được điều tiết (throttle) bằng requestAnimationFrame để đảm bảo tốc độ khung hình.  
* **NFR2 \- Isolation (Sự cô lập):** Các thành phần UI của extension (tooltip, toggle buttons) phải được render bên trong **Shadow DOM** để ngăn chặn xung đột CSS (style bleeding) từ trang web chủ (host page).  
* **NFR3 \- Tech Stack Constraints (Ràng buộc công nghệ):** Sử dụng **Vanilla JavaScript** (không framework nặng) để giảm thiểu footprint khi inject vào trang. Tuân thủ kiến trúc **Chrome Extension Manifest V3**.  
* **NFR4 \- Platform Scope (Phạm vi nền tảng):** Chỉ hỗ trợ trình duyệt Desktop Chrome/Chromium. Không hỗ trợ mobile trong phiên bản MVP.  
* **NFR5 \- Fixed Unit (Đơn vị cố định):** Kích thước lưới được gán cứng (hardcoded) là **14px**. Không có UI tùy chỉnh kích thước trong phiên bản MVP.

## **3\. User Interface Design Goals (Mục tiêu Thiết kế Giao diện)**

### **3.1 Overall UX Vision (Tầm nhìn UX tổng thể)**

Tối giản, Công cụ hóa, "Vô hình" (Invisible). Giao diện người dùng không được tranh giành sự chú ý với nội dung trang web. Nó hoạt động như một lớp overlay kỹ thuật ("heads-up display" \- HUD) chỉ xuất hiện khi cần thiết.

### **3.2 Key Interaction Paradigms (Mô hình tương tác chính)**

* **Activation (Kích hoạt):** Nhấp vào biểu tượng Extension trên thanh browser toolbar.  
* **Discovery (Khám phá):** Di chuột (Hover) để thấy viền xanh (Blue Outline) quanh các phần tử DOM khả dụng.  
* **Locking (Khóa lưới):** Nhấp chuột trái (Left-click) để ghim lưới vào phần tử. Lưới trước đó (nếu có) sẽ biến mất (Single Instance rule).  
* **Measurement (Đo lường):** Giữ phím Alt để kích hoạt chế độ đo tạm thời. Nhả phím để thoát.

### **3.3 Core Screens and Views (Các màn hình/chế độ hiển thị chính)**

* **Selection State:** Viền xanh nhạt (Light Blue Outline) bao quanh phần tử đang được hover.  
* **Active Grid Overlay:** Lưới 14x14px (Màu Cyan/Magenta, opacity 30%) phủ lên phần tử đã chọn.  
* **Measurement Tooltip:** Hộp thông tin nhỏ (floating tooltip) hiển thị tọa độ delta (ví dụ: x: \+2px, y: 0\) xuất hiện cạnh con trỏ chuột khi giữ Alt.

### **3.4 Accessibility (Khả năng truy cập)**

* **Standard:** WCAG AA (cho độ tương phản của các đường lưới và văn bản trong tooltip).  
* **Color Blindness:** Hỗ trợ tùy chọn màu sắc (nếu có thể trong tương lai) hoặc chọn màu Cyan/Magenta mặc định có độ tương phản tốt trên cả nền sáng và tối.

### **3.5 Branding (Thương hiệu)**

* Sử dụng phong cách "Technical Blueprint" (Bản vẽ kỹ thuật).  
* Màu chủ đạo: Cyan (\#00FFFF) hoặc Magenta (\#FF00FF) để đảm bảo nổi bật trên hầu hết các thiết kế web.

### **3.6 Target Device and Platforms (Thiết bị và Nền tảng mục tiêu)**

* **Desktop Chrome/Chromium Only:** Do tính chất của công cụ development và thao tác hover/phím tắt, phiên bản MVP chỉ hỗ trợ Desktop.

## **4\. Technical Assumptions (Giả định Kỹ thuật)**

### **4.1 Repository Structure (Cấu trúc kho mã)**

* **Single Repo (Monorepo style):** Dự án nhỏ, chứa toàn bộ mã nguồn extension.  
  * /src: Mã nguồn chính (Background scripts, Content scripts, Popup UI).  
  * /assets: Icons, images.  
  * /dist hoặc /build: Output sau khi build (nếu dùng bundler).

### **4.2 Service Architecture (Kiến trúc dịch vụ)**

* **Client-side Only:** Extension hoạt động độc lập trên trình duyệt người dùng. Không có backend server, không có database, không có API calls ra ngoài (ngoại trừ có thể là telemetry trong tương lai, nhưng MVP thì không).  
* **Communication:** Sử dụng Chrome Messaging API để giao tiếp giữa popup (nếu có), background service worker (quản lý state bật/tắt) và content script (xử lý DOM/Grid).

### **4.3 Testing Requirements (Yêu cầu kiểm thử)**

* **Unit Testing:** Bắt buộc cho các hàm logic tính toán tọa độ và đo lường (measurement logic). Sử dụng **Jest** hoặc **Vitest**.  
* **Manual Testing:** Do tính chất visual cao, việc kiểm thử thủ công trên các trang WordPress thực tế là quan trọng nhất.  
* **No E2E Automation (MVP):** Chưa cần thiết lập Cypress/Selenium cho giai đoạn này để tiết kiệm thời gian.

### **4.4 Additional Technical Assumptions (Các giả định khác)**

* **Build Tool:** Sử dụng **Vite** để bundle code. Dù dùng Vanilla JS, Vite giúp quản lý modules tốt hơn, hot-reload khi dev, và tối ưu hóa kích thước file production.  
* **Manifest Version:** Bắt buộc **Manifest V3**.  
* **Permissions:** Hạn chế tối đa quyền, chỉ xin quyền activeTab để đảm bảo tính riêng tư và dễ dàng được duyệt trên Store.

## **5\. Epic List (Danh sách Epic)**

### **5.1 Epic 1: Foundation & Core Grid Injection**

**Mục tiêu:** Thiết lập nền tảng dự án (Vite \+ Manifest V3) và cung cấp tính năng cốt lõi: kích hoạt extension, chọn phần tử, và hiển thị lưới 14px cơ bản.

### **5.2 Epic 2: Smart Measurement & Polish**

**Mục tiêu:** Hoàn thiện công cụ với tính năng đo lường nâng cao (Story 4\) và tối ưu hóa để phát hành.

## **6\. Epic Details (Chi tiết Epic)**

### **6.1 Epic 1: Foundation & Core Grid Injection**

**Expanded Goal:** Thiết lập kiến trúc extension hoạt động được trên Chrome (Manifest V3), triển khai cơ chế tìm và chọn phần tử DOM mục tiêu, và hiển thị lớp phủ lưới 14px (bằng CSS/SVG) neo chính xác vào phần tử đó mà không làm chặn tương tác của người dùng.

#### **6.1.1 Story 1.1: Project Scaffolding & Manifest V3 Setup**

* **User Story:** Với tư cách là Developer, tôi muốn có một hệ thống build extension hoạt động được bằng Vite và Manifest V3, để tôi có thể phát triển extension theo tiêu chuẩn hiện đại.  
* **Acceptance Criteria:**  
  1. Lệnh npm run build tạo ra thư mục dist chứa file manifest.json hợp lệ (V3), các file JS của background và content script đã được bundle.  
  2. Có thể load extension vào Chrome Developer Mode (Load Unpacked) mà không báo lỗi.  
  3. Extension có một Popup đơn giản hoặc Icon hoạt động được trên toolbar.  
  4. Content Script chạy được trên một trang web bất kỳ và log ra console dòng "WP Inspector Ready".

#### **6.1.2 Story 1.2: Element Discovery & Highlighting**

* **User Story:** Với tư cách là Người dùng, tôi muốn thấy hiệu ứng viền sáng (highlight) khi di chuột qua các phần tử trên trang, để tôi biết chính xác phần tử nào sẽ được chọn để phủ lưới.  
* **Acceptance Criteria:**  
  1. Khi di chuột (hover) qua một phần tử DOM, một viền màu xanh (Blue Outline) xuất hiện bao quanh phần tử đó.  
  2. Khi di chuột ra ngoài, viền xanh biến mất.  
  3. Hiệu năng phải mượt mà, không gây giật lag khi di chuột nhanh qua nhiều phần tử lồng nhau (cần sử dụng throttling/debouncing hoặc requestAnimationFrame).  
  4. Chỉ highlight các phần tử có thể nhìn thấy và có kích thước thực (không highlight các phần tử ẩn hoặc 0x0 px).

#### **6.1.3 Story 1.3: Grid Overlay Injection (The "Lock")**

* **User Story:** Với tư cách là Người dùng, tôi muốn nhấp chuột vào phần tử đang được highlight để "ghim" (lock) lưới 14px vào đó, để tôi có thể kiểm tra căn chỉnh.  
* **Acceptance Criteria:**  
  1. Sự kiện click vào phần tử đang highlight sẽ kích hoạt việc tạo lưới.  
  2. Lưới được render bên trong một **Shadow DOM** host được gắn vào (hoặc đè lên) phần tử mục tiêu để đảm bảo style cô lập.  
  3. Mẫu lưới (Grid Pattern) phải là các ô vuông 14px x 14px.  
  4. Gốc tọa độ (0,0) của lưới phải trùng khớp chính xác với góc trên-trái của **Padding Box** của phần tử mục tiêu.  
  5. Nếu đã có một lưới khác đang hiển thị ở nơi khác, nó phải bị xóa trước khi lưới mới xuất hiện (Quy tắc Single Instance).

#### **6.1.4 Story 1.4: Click-Through Transparency**

* **User Story:** Với tư cách là Developer, tôi muốn có thể nhấp chuột và tương tác với các phần tử bên dưới lớp lưới, để quy trình làm việc của tôi không bị gián đoạn.  
* **Acceptance Criteria:**  
  1. Container chứa lưới phải có thuộc tính CSS pointer-events: none.  
  2. Người dùng có thể click vào các nút bấm, link, hoặc input form nằm bên dưới lưới.  
  3. Người dùng có thể bôi đen văn bản nằm bên dưới lưới.  
  4. Người dùng có thể chuột phải để mở Context Menu của Chrome lên phần tử bên dưới lưới (Inspect Element).

### **6.2 Epic 2: Smart Measurement & Polish**

**Expanded Goal:** Triển khai công cụ đo lường thông minh (Smart Measurement) giúp developer phát hiện độ lệch pixel chính xác, tối ưu hóa hiệu năng ứng dụng, và hoàn thiện các assets cần thiết để đóng gói sản phẩm cuối cùng.

#### **6.2.1 Story 2.1: Measurement Core Logic (The Brain)**

* **User Story:** Với tư cách là Developer, tôi muốn hệ thống tính toán khoảng cách từ con trỏ chuột đến dòng kẻ lưới gần nhất khi tôi kích hoạt chế độ đo, để tôi biết mình đang lệch bao nhiêu pixel.  
* **Acceptance Criteria:**  
  1. Logic tính toán chỉ chạy khi phím Alt được giữ (keydown) và dừng ngay khi nhả (keyup).  
  2. Hệ thống lấy tọa độ con trỏ chuột (Mouse X, Y) tương đối so với Active Container.  
  3. Công thức tính Delta:  
     * Khoảng cách đến dòng dọc gần nhất \= MouseX % 14\. Nếu kết quả \> 7, Delta là số âm (khoảng cách đến dòng tiếp theo).  
  4. Kết quả đầu ra là một object { deltaX, deltaY } được cập nhật liên tục khi chuột di chuyển.

#### **6.2.2 Story 2.2: Measurement Tooltip UI (The Face)**

* **User Story:** Với tư cách là Người dùng, tôi muốn nhìn thấy một hộp thông tin (tooltip) nhỏ đi theo con trỏ chuột hiển thị các chỉ số Delta, để tôi có thể đọc kết quả ngay lập tức mà không cần nhìn đi chỗ khác.  
* **Acceptance Criteria:**  
  1. Hiển thị Tooltip chứa text dạng x: \+2px, y: \-1px.  
  2. Tooltip phải nằm bên trong Shadow DOM để không bị ảnh hưởng bởi CSS của trang web.  
  3. Vị trí Tooltip luôn nằm cạnh con trỏ chuột (có offset khoảng 10-15px) để không che khuất điểm đang đo.  
  4. Tooltip tự động ẩn khi người dùng nhả phím Alt.

#### **6.2.3 Story 2.3: Performance Optimization & Polish**

* **User Story:** Với tư cách là Người dùng, tôi muốn công cụ hoạt động mượt mà kể cả khi tôi scroll trang hoặc thay đổi kích thước cửa sổ, và không gây ngốn RAM trình duyệt.  
* **Acceptance Criteria:**  
  1. Sử dụng requestAnimationFrame cho tất cả các sự kiện mousemove trong chế độ đo lường.  
  2. Xử lý sự kiện scroll và resize: Lưới và vùng đo lường phải giữ đúng vị trí tương đối với phần tử mục tiêu (hoặc tự động tính toán lại vị trí).  
  3. Dọn dẹp (Cleanup): Đảm bảo tất cả Event Listeners được gỡ bỏ khi Extension bị tắt hoặc chuyển sang phần tử khác để tránh Memory Leak.

#### **6.2.4 Story 2.4: Packaging & Assets Preparation**

* **User Story:** Với tư cách là Product Owner, tôi muốn có đầy đủ bộ cài đặt và tài sản hình ảnh để có thể upload lên Chrome Web Store hoặc gửi cho tester.  
* **Acceptance Criteria:**  
  1. Có đầy đủ bộ Icon kích thước chuẩn (16, 32, 48, 128px).  
  2. File manifest.json hoàn chỉnh với các thông tin metadata (tên, mô tả, version).  
  3. Lệnh npm run package (hoặc tương đương) tạo ra một file .zip chứa bản build production đã được tối ưu hóa (minified code).

## **7\. Checklist Results Report (Báo cáo Kết quả Kiểm tra)**

Sau khi đối chiếu với PM Checklist, dưới đây là kết quả xác thực cho PRD V1.0:

| Category | Status | Notes |
| :---- | :---- | :---- |
| **1\. Problem Definition** | ✅ **PASS** | Vấn đề "Global Grid Fallacy" và "Visual Noise" được xác định rõ ràng. |
| **2\. MVP Scope** | ✅ **PASS** | Phạm vi được giới hạn tốt (chỉ Desktop, 14px fixed, Single Instance). Phù hợp để phát triển nhanh. |
| **3\. User Experience** | ✅ **PASS** | Tương tác "Click-through" và "Targeted Activation" giải quyết đúng nỗi đau của người dùng. |
| **4\. Functional Req** | ✅ **PASS** | 2 Epics bao phủ đầy đủ 4 User Stories cốt lõi. Không có tính năng thừa. |
| **5\. Technical** | ✅ **PASS** | Stack (Vite, Vanilla JS, Manifest V3) và Shadow DOM là lựa chọn hợp lý cho Extension hiện đại. |
| **6\. Clarity** | ✅ **PASS** | Các thuật ngữ như "Active Container", "Padding Box", "Delta" được định nghĩa rõ. |

**Kết luận:** PRD đã hoàn thiện và **SẴN SÀNG (READY)** để chuyển giao cho đội ngũ Kỹ thuật và Thiết kế.

## **8\. Next Steps (Các bước tiếp theo)**

### **8.1 UX Expert Prompt**

Role: UX Designer  
Task: Create High-Fidelity Mockups for "WP 14px Rhythm Inspector" Extension.  
Input: docs/prd.md  
Focus Areas:  
1\.  Visual Style: "Technical Blueprint" aesthetic.  
2\.  Color Palette: High-contrast Cyan (\#00FFFF) & Magenta (\#FF00FF) suitable for overlay on diverse backgrounds.  
3\.  Components:  
    \* Hover State (Blue Outline).  
    \* Grid Overlay (14px squares, 1px stroke, opacity).  
    \* Measurement Tooltip (Floating, clear typography, Shadow DOM isolation).  
4\.  Deliverables: SVG assets for the Grid pattern and Icon set (16-128px).

### **8.2 Architect Prompt**

Role: Software Architect  
Task: Design Technical Architecture for Chrome Extension (Manifest V3).  
Input: docs/prd.md  
Constraints: Vanilla JS, Vite, Shadow DOM, No External Frameworks.  
Key Challenges to Solve:  
1\.  Precise Grid Injection: Calculating \`padding-box\` coordinates relative to the viewport vs. document.  
2\.  Scroll Sync: Ensuring the grid stays "pinned" when the user scrolls (handling \`absolute\` vs \`fixed\` positioning contexts).  
3\.  Measurement Math: Efficient algorithm for \`MouseX % 14\` delta calculation within \`requestAnimationFrame\`.  
4\.  Project Structure: Set up the Monorepo structure for \`src/background\`, \`src/content\`, \`src/popup\`.  
