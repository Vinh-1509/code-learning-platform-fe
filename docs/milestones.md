**Milestone 1 (12/04 - 26/04): Product definition & Project initialization**

- Xác định vấn đề và giải pháp
- Danh sách tính năng của sản phẩm
- Khởi tạo repo, và các phần liên quan (FE, BE, database,...), kèm link GitHub cho từng repo
- Đối với FE (TypeScript + React.js): Repo phải chạy được, và trình duyệt có thể truy cập localhost để hiện lên một trang web cơ bản (demo được chữ "Hello world" trên trang là được)
- Đối với BE (TypeScript + NestJS hoặc Express.js): Repo phải chạy được, có một GET endpoint cơ bản có thể gọi được ở localhost (có thể demo bằng Postman), và đã có thể kết nối thành công với Database (GET endpoint có thể trả về data được tạo sẵn trong database) Đối với Database (MongoDB): Được khởi tạo với MongoDB Atlas, và có 1 collection

**Milestone 2 (26/04 - 10/05): Design prototype & Survey UI/UX/Use Case**

- User Flow: Xây dựng user flow hoàn chỉnh cho các use case chính của sản phẩm.
- Figma Design: Thiết kế các màn hình chính trên Figma. Tạo prototype để mô phỏng user journey và các tương tác cơ bản. Yêu cầu: Design có tính thẩm mỹ, logic, và nhất quán; hỗ trợ nhiều kích thước màn hình (tối thiểu: 1 Mobile view và 1 Desktop view)
- Khảo sát UI/UX: Thực hiện khảo sát với user thật. Nội dung và mục đích khảo sát do nhóm tự quyết định. Yêu cầu: Chứng minh đã khảo sát với người dùng thật; trình bày mục đích, nội dung, và kết quả khảo sát; nêu rõ insight rút ra và các điều chỉnh của sản phẩm dựa trên kết quả khảo sát
- API Design: Lập danh sách API của hệ thống, bao gồm: endpoint, method, mô tả chức năng
- Database Design: Thiết kế database schema cho hệ thống. Yêu cầu:
  - Danh sách collections
  - Các fields chính trong mỗi collection
  - Mối quan hệ giữa các collection (nếu có)
  - Schema phải phù hợp với user flow và API đã thiết kế

**Milestone 3 (10/05 - 21/06): Implementation**

- Tập trung hiện thực hóa sản phẩm từ prototype thành MVP hoạt động thực tế
- Hoàn thiện các chức năng chính, backend, database và triển khai hệ thống
- Đảm bảo có deployment online ổn định để phục vụ testing, thu thập user feedback và DemoDay

Milestone 3 được chia thành 2 giai đoạn chính:

-- Milestone 3A (10/05 - 31/05): Core MVP Build

- Hoàn thiện end-to-end flow cho các use case chính của sản phẩm
- Hiện thực UI (PC/desktop-first) và kết nối frontend với backend/API
- Thiết lập backend, xây dựng các API cốt lõi
- Hiện thực logic cá nhân hóa cơ bản (AI)
- Deploy phiên bản MVP đầu tiên để team và mentor test nội bộ

-- Milestone 3B (31/05 - 21/06): Complete MVP + Improve

- Hoàn thiện các flow còn thiếu, xử lý edge cases và error cases
- Cải thiện UI/UX, responsiveness (hỗ trợ màn hình mobile)
- Tinh chỉnh logic cá nhân hóa dựa trên testing/feedback từ mentor
- Đảm bảo hệ thống deploy ổn định, sẵn sàng cho user dùng thử và DemoDay

⚠️ Lưu ý:

- Điều kiện bắt buộc để tham gia DemoDay: Nhóm phải deploy thành công web app, và web có thể được truy cập bởi trình duyệt web của một thiết bị bất kì.
- Scope của MVP: phải thỏa mãn đề bài cuộc thi "Personalized Code Learning Platform", gồm 1 tính năng/flow học tập hoàn chỉnh (Code Learning Platform), và 1 tính năng AI cá nhân hóa quá trình học tập (Personalized).
- Mỗi giai đoạn trong Milestone 3 (3A và 3B), sẽ có deadline, và meeting báo cáo tương ứng (cách làm việc như một milestone độc lập)

**Milestone 4 (21/06 - 28/06): User Feedback**

**Milestone 5 (28/06 - 12/07): Prepare presentation for DemoDay**
