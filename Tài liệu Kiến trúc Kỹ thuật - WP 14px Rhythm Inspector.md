# **Tài liệu Kiến trúc Kỹ thuật \- WP 14px Rhythm Inspector**

| Ngày | Phiên bản | Mô tả | Tác giả |
| :---- | :---- | :---- | :---- |
| 21/11/2025 | 1.0 | Khởi tạo kiến trúc ban đầu (Manifest V3, Vanilla JS, Vite) | Winston (Architect) |

## **1\. Giới thiệu**

Tài liệu này phác thảo kiến trúc kỹ thuật cho **WP 14px Rhythm Inspector**, một tiện ích mở rộng Chrome được thiết kế để giúp các nhà phát triển WordPress kiểm tra độ chính xác của lưới dọc (vertical rhythm).

### **Mục tiêu Kiến trúc**

1. **Hiệu năng (60fps):** Đảm bảo việc cuộn trang mượt mà khi lưới đang hiển thị, sử dụng chiến lược "Direct Child Injection".  
2. **Không xâm lấn (Non-intrusive):** Đảm bảo sự kiện chuột đi xuyên qua lưới (click-through) và CSS của lưới không bị ảnh hưởng bởi trang web (Shadow DOM).  
3. **Đơn giản (Simplicity):** Sử dụng Vanilla JS thuần túy, không phụ thuộc vào các framework runtime nặng nề (React/Vue).

## **2\. Kiến trúc Cấp cao (High-Level Architecture)**

Hệ thống tuân theo mô hình **Chrome Extension Manifest V3** tiêu chuẩn. Logic chính tập trung tại **Content Script**, trong khi **Popup** và **Background** đóng vai trò hỗ trợ tối thiểu.

### **Sơ đồ Hệ thống**

graph TD  
    subgraph "Chrome Browser Context"  
        User\[Hành động Người dùng: Hover/Click/Alt\] \--\>|Event| ContentScript  
    end

    subgraph "Extension Core"  
        Popup\[Popup UI\] \--\>|Message: Toggle| ContentScript  
        Background\[Service Worker\] \-.-\>|Lifecycle/Install| ContentScript  
    end

    subgraph "Content Script (Logic Chính)"  
        Controller\[Inspector Controller\]  
          
        subgraph "Modules"  
            Selector\[Element Selector\]  
            GridMgr\[Grid Manager\]  
            Measure\[Measurement Engine\]  
        end  
          
        Controller \--\>|Coordination| Selector  
        Controller \--\>|Coordination| GridMgr  
        Controller \--\>|Coordination| Measure  
    end

    subgraph "DOM Injection (Shadow DOM)"  
        Target\[Phần tử Mục tiêu\] \--\>|Chứa| ShadowHost\[\<div id='wp-rhythm-root'\>\]  
        ShadowHost \--\>|Shadow Root| ShadowTree  
        ShadowTree \--\> Grid\[Grid Overlay\]  
        ShadowTree \--\> Tooltip\[Measurement Tooltip\]  
    end

    style ShadowHost fill:\#f9f,stroke:\#333,stroke-width:2px

### **Các Quyết định Kỹ thuật Chính**

1. **Chiến lược Tiêm (Direct Child Injection):** Grid được tiêm trực tiếp làm con của phần tử mục tiêu (position: absolute, inset: 0). Điều này cho phép Grid cuộn tự nhiên theo phần tử cha mà không cần tính toán lại vị trí liên tục, giải quyết triệt để vấn đề "Scroll Sync".  
2. **Shadow DOM:** Toàn bộ UI (Grid, Tooltip) nằm trong Shadow Root open để cách ly CSS tuyệt đối.  
3. **Event Passthrough:** Container của Grid sử dụng pointer-events: none để cho phép click xuyên thấu.

## **3\. Ngăn xếp Công nghệ (Tech Stack)**

| Hạng mục | Công nghệ | Phiên bản | Mục đích & Ghi chú |
| :---- | :---- | :---- | :---- |
| **Runtime** | Vanilla JS (ESNext) | ES2022+ | Logic chính. Không sử dụng Framework runtime. |
| **Extension Platform** | Manifest V3 | V3 | Yêu cầu bắt buộc của Chrome Store. |
| **Build Tool** | **Vite** | 5.x | Bundling, Minification, HMR. |
| **Vite Plugin** | **@crxjs/vite-plugin** | Latest | Tự động hóa Manifest và Hot Reload cho Content Script. |
| **Testing** | **Vitest** \+ JSDOM | Latest | Unit Test cho logic tính toán tọa độ. |
| **CSS Strategy** | Standard CSS Files | N/A | Import qua Vite (import './style.css'). |

## **4\. Thiết kế Component (Component Architecture)**

Mã nguồn sẽ được tổ chức theo hướng module hóa (Modular Vanilla JS) thay vì hướng đối tượng nặng nề, tận dụng ES Modules.

### **4.1. src/content/InspectorController.js (Singleton)**

Bộ não của ứng dụng.

* **Trách nhiệm:** Khởi tạo các module con, lắng nghe message từ Background/Popup, quản lý trạng thái toàn cục (Active/Inactive).  
* **State:**  
  * isActive: boolean (Trạng thái bật/tắt tổng)  
  * lockedElement: HTMLElement (Phần tử đang được pin lưới)

### **4.2. src/content/ElementSelector.js**

Quản lý việc highlight phần tử khi hover.

* **Trách nhiệm:**  
  * Lắng nghe mousemove (khi chưa lock).  
  * Vẽ viền xanh (Outline) quanh event.target.  
  * Xử lý click để chọn phần tử và kích hoạt GridManager.  
* **Tối ưu:** Sử dụng requestAnimationFrame để throttle sự kiện mousemove.

### **4.3. src/content/GridManager.js**

Quản lý vòng đời của Grid Overlay.

* **Trách nhiệm:**  
  * inject(targetElement): Tạo Shadow Host, tiêm CSS và HTML lưới vào targetElement.  
  * remove(): Dọn dẹp Shadow Host khỏi DOM.  
  * **Xử lý Edge Case position: static:** Nếu targetElement có position: static, GridManager sẽ tạm thời gán class nội bộ để set position: relative cho target, đảm bảo Grid hiển thị đúng.  
* **Cấu trúc DOM sinh ra:**  
  \<div id="wp-rhythm-host" style="position: absolute; inset: 0; pointer-events: none; z-index: 9999;"\>  
    \#shadow-root (open)  
      \<style\>...css...\</style\>  
      \<div class="grid-pattern"\>\</div\>  
      \<div class="tooltip hidden"\>\</div\>  
  \</div\>

### **4.4. src/content/MeasurementEngine.js**

Xử lý toán học và đo lường.

* **Trách nhiệm:**  
  * Lắng nghe phím Alt (keydown/keyup).  
  * Tính toán Delta: (MouseX \- Rect.left) % 14\.  
  * Cập nhật nội dung và vị trí của Tooltip bên trong Shadow DOM.  
* **Thuật toán Delta:**  
  // Pseudo-code  
  const localX \= event.clientX \- rect.left;  
  const remainderX \= localX % 14;  
  const deltaX \= remainderX \> 7 ? remainderX \- 14 : remainderX;  
  // Result: \-7 đến \+7 (px)

## **5\. Luồng hoạt động cốt lõi (Core Workflows)**

### **5.1. Luồng Kích hoạt & Khóa Lưới (Activation & Locking)**

sequenceDiagram  
    participant User  
    participant Selector  
    participant GridMgr  
    participant DOM

    User-\>\>Selector: Hover lên phần tử  
    Selector-\>\>DOM: Vẽ viền xanh (Outline)  
    User-\>\>Selector: Click chuột trái  
    Selector-\>\>GridMgr: lock(element)  
    GridMgr-\>\>DOM: Kiểm tra 'position' của element  
    alt Element là Static  
        GridMgr-\>\>DOM: Set position: relative  
    end  
    GridMgr-\>\>DOM: Append Shadow Host (Grid)  
    GridMgr-\>\>User: Hiển thị Lưới 14px

### **5.2. Luồng Đo lường (Measurement Mode)**

sequenceDiagram  
    participant User  
    participant MeasureEng  
    participant TooltipUI

    User-\>\>MeasureEng: Giữ phím Alt (KeyDown)  
    MeasureEng-\>\>TooltipUI: Hiển thị Tooltip  
    loop Mouse Move  
        User-\>\>MeasureEng: Di chuyển chuột  
        MeasureEng-\>\>MeasureEng: Tính Delta (Mouse % 14\)  
        MeasureEng-\>\>TooltipUI: Cập nhật Text (x: \+2, y: \-1) & Vị trí  
    end  
    User-\>\>MeasureEng: Thả phím Alt (KeyUp)  
    MeasureEng-\>\>TooltipUI: Ẩn Tooltip

## **6\. Cấu trúc Thư mục (Project Structure)**

Sử dụng cấu trúc Monorepo đơn giản hóa, phân tách rõ ràng theo context của Chrome Extension.

wp-rhythm-inspector/  
├── src/  
│   ├── assets/                 \# Icons, Images  
│   ├── background/             \# Service Worker  
│   │   └── index.js  
│   ├── content/                \# Content Script (Logic chính)  
│   │   ├── components/         \# UI Components (Grid, Tooltip)  
│   │   │   ├── grid.css  
│   │   │   └── tooltip.css  
│   │   ├── modules/            \# Logic Modules  
│   │   │   ├── ElementSelector.js  
│   │   │   ├── GridManager.js  
│   │   │   └── MeasurementEngine.js  
│   │   ├── utils/              \# Helpers (Math, DOM)  
│   │   └── index.js            \# Entry point  
│   ├── popup/                  \# Popup UI  
│   │   ├── index.html  
│   │   ├── index.js  
│   │   └── style.css  
│   └── manifest.js             \# Manifest Config (cho CRXJS)  
├── tests/                      \# Vitest Tests  
├── vite.config.js              \# Vite \+ CRXJS Config  
├── package.json  
└── README.md

## **7\. Tiêu chuẩn Lập trình (Coding Standards)**

* **Không dùng var:** Chỉ dùng const và let.  
* **Module hóa:** Mọi file JS trong src/content/modules phải export default class hoặc export function.  
* **DOM Access:** Hạn chế truy cập DOM global document. Luôn scope query trong targetElement hoặc shadowRoot nếu có thể.  
* **Magic Numbers:** Số 14 (kích thước lưới) phải được định nghĩa là hằng số GRID\_SIZE \= 14\.  
* **JSDoc:** Bắt buộc comment JSDoc cho các hàm tính toán toán học phức tạp.

## **8\. Rủi ro & Giới hạn (Risks & Limitations)**

1. **Layout Shift (Rủi ro thấp):** Việc chuyển position: static sang relative trên phần tử mục tiêu có thể gây ra thay đổi layout nhỏ (ví dụ: ảnh hưởng đến z-index context hoặc top/left không mong muốn).  
   * *Mitigation:* Chỉ áp dụng thay đổi này khi lưới active, và hoàn trả trạng thái cũ ngay khi tắt lưới.  
2. **Z-Index War:** Lưới có thể bị che bởi các phần tử con có z-index cao hơn trong cùng stacking context.  
   * *Mitigation:* Shadow Host sẽ được set z-index: 2147483647 (max int), nhưng vẫn phụ thuộc vào stacking context của phần tử cha. Đây là giới hạn chấp nhận được của chiến lược "Direct Child Injection".

*Hết tài liệu kiến trúc.*