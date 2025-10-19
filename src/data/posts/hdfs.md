---
title: "🐘 HDFS – Hệ thống tệp phân tán của Hadoop"
description: "Khám phá HDFS - Hệ thống tệp phân tán của Hadoop, giải pháp lưu trữ và xử lý dữ liệu lớn."
date: "12-10-2025"
tags: ["Phúc Nhân", "Data Center", "Research", "HDFS", "Big Data"]
author: "Phúc Nhân"
slug: "hdfs"
---
# 🐘 HDFS – Hệ thống tệp phân tán của Hadoop
## 🐘 Giới thiệu HDFS 
HDFS (Hadoop Distributed File System) là hệ thống tệp phân tán được thiết kế để chạy trên phần cứng thường (commodity hardware) nhằm lưu trữ và xử lý dữ liệu quy mô lớn. HDFS có khả năng chịu lỗi cao (fault-tolerant) và tối ưu cho mức throughput cao với các ứng dụng xử lý lô (batch processing) dữ liệu lớn. Mỗi tệp tin trên HDFS thường rất lớn (hàng gigabyte đến terabyte) và hệ thống có thể mở rộng đến hàng trăm node, hỗ trợ hàng chục triệu tệp trong một cluster. HDFS được phát triển như là phần cốt lõi của dự án Apache Hadoop, ra đời từ năm 2006. Ý tưởng Hadoop ban đầu được truyền cảm hứng từ các bài báo của Google (Hệ thống tệp của Google năm 2003 và MapReduce 2004). Nhà sáng lập Doug Cutting – khi đó đang làm tại Yahoo! – đặt tên Hadoop theo chú voi bông của con trai mình. Phiên bản đầu tiên (0.1.0) của Hadoop phát hành tháng 4/2006. Trong những năm sau đó, HDFS đã được tách ra từ dự án Nutch để trở thành một dự án con của Hadoop (HDFS 5.000 dòng mã, MapReduce 6.000 dòng mã ban đầu). Ngày nay HDFS là thành phần lưu trữ cốt lõi của Hadoop, song song với các công cụ xử lý như MapReduce, YARN, Hive, và cả Spark.

## 🕰️ Lịch sử phát triển của HDFS
HDFS vốn được xây dựng cho dự án Apache Nutch (công cụ tìm kiếm) từ khoảng năm 2007. Tên “Hadoop” được đặt năm 2006 và phiên bản ổn định đầu tiên ra đời vào tháng 4/2006. Các nguồn gốc lý thuyết của HDFS bắt nguồn từ hệ thống tệp của Google (Google File System – GFS) và mô hình MapReduce của Google. Tuy nhiên, HDFS đã được thiết kế để đa dạng hóa hơn GFS: Hỗ trợ nhiều node, tự động nhân bản dữ liệu, và thân thiện với cả Java (Hadoop viết bằng Java, có thể chạy trên bất kỳ máy nào có JVM). Tính đến nay, Hadoop (bao gồm HDFS) đã qua nhiều phiên bản: Hadoop 1 (gồm Hadoop Common, HDFS, MapReduce), Hadoop 2 (thêm YARN) và Hadoop 3 (thêm hỗ trợ Erasure Coding, Multi-NameNode…). Các đặc điểm thiết kế ban đầu của HDFS – như ghi một lần, đọc nhiều (write-once-read-many) – vẫn được duy trì để đảm bảo hiệu năng cao khi xử lý các tệp lớn. Nhìn chung, lịch sử HDFS là câu chuyện của sự đi lên từ ý tưởng của Google thành một hệ thống mở, phổ biến trong cộng đồng xử lý Big Data.
![hdfs-history](https://miro.medium.com/v2/resize:fit:1400/0*23y41Btkok6WPBPc.png)

## ⚙️ Cơ chế hoạt động của HDFS

HDFS tuân theo mô hình master/slave: trên mỗi cluster có một NameNode (máy chủ chính) và nhiều DataNode (máy chủ lưu dữ liệu). NameNode đóng vai trò quản lý namespace (cây thư mục, tên file) và phân bổ khối dữ liệu cho các DataNode. Các DataNode chịu trách nhiệm lưu trữ và phục vụ thực tế các khối (block) dữ liệu khi người dùng đọc/ghi tệp. Nhờ vậy, dữ liệu của người dùng không bao giờ đi qua NameNode, tránh trở thành nghẽn cổ chai. Ví dụ trong hình dưới đây minh họa kiến trúc HDFS truyền thống:
![hdfs-architecture](https://hadoop.apache.org/docs/r1.2.1/images/hdfsarchitecture.gif)
NameNode lưu trữ metadata toàn bộ hệ thống tệp (thư mục, file, quyền truy cập, vị trí các khối dữ liệu) – thường là toàn bộ duy nhất và được giữ trong bộ nhớ của NameNode. DataNode lưu dữ liệu trên ổ cứng của mình, và định kỳ gửi “heartbeat” và BlockReport về cho NameNode. BlockReport liệt kê tất cả các block mà DataNode đang lưu. Nhờ đó, NameNode biết được kho dữ liệu có bao nhiêu bản sao (replica) của mỗi block trên các DataNode. Tại bất kỳ thời điểm nào, NameNode kiểm tra số lượng bản sao của mỗi block: nếu có block nào bị mất (do DataNode hỏng hoặc mất kết nối), NameNode sẽ ra lệnh sao chép bù tới các DataNode khác để đảm bảo replication factor (mặc định 3). Phương thức này giúp HDFS tự động phục hồi khi có lỗi phần cứng: nếu một DataNode chết, các block trên đó sẽ được tái nhân rộng lên nút còn sống.

Một số đặc điểm quan trọng của HDFS:

- Thiết kế đơn giản: HDFS chỉ hỗ trợ các phép I/O cơ bản (mở file, ghi một lần, đóng file, đọc tuần tự, xóa, đổi tên). Nó không hỗ trợ sửa đổi ngẫu nhiên trong file hoặc thao tác POSIX đầy đủ. Điều này giúp tập trung tối ưu cho luồng dữ liệu lớn, giảm độ phức tạp.
- Khối dữ liệu (block): Dữ liệu của mỗi file được chia thành các block cố định (thường 128MB hoặc 256MB) và phân tán trên các DataNode. Việc chia block lớn giúp giảm overhead khi quản lý file (so với hàng triệu file nhỏ), và cho phép dùng hiệu quả băng thông khi truyền tải.
- Nhân bản dữ liệu: Mỗi block được lưu nhiều bản sao (replica) trên các DataNode khác nhau để đảm bảo độ bền. Replication factor có thể cấu hình theo nhu cầu hoặc mặc định của hệ thống (thường là 3).
- Hiệu năng cao: HDFS được tối ưu cho truyền luồng dữ liệu lớn (streaming). Do đặt computation gần dữ liệu (“Move computation to data”), Hadoop và Spark có thể tận dụng tính chất locality, giảm tải mạng và tăng throughput.
- Đơn giản và ổn định: HDFS coi lỗi phần cứng là bình thường. NameNode và DataNode đều có khả năng phát hiện lỗi (qua heartbeat) và tự phục hồi, giúp cluster luôn sẵn sàng.
Bạn có thể chạy HDFS dưới nhiều chế độ khác nhau. Trên một máy đơn, có thể chạy Standalone mode (hadoop chỉ là một tiến trình đơn, để debug) hoặc Pseudo-distributed mode (từng daemon Hadoop chạy riêng biệt trên cùng một máy). Ví dụ, tài liệu Hadoop cho biết “Hadoop có thể chạy trên một máy đơn ở chế độ pseudo-distributed, khi mỗi daemon Hadoop (NameNode, DataNode, ResourceManager, NodeManager…) chạy trong một tiến trình Java riêng”. Đây là cách đơn giản để thử nghiệm HDFS trên local trước khi triển khai cluster.

# 📦 Tổ chức HDFS
Chạy HDFS cục bộ: Với môi trường thử nghiệm hoặc phát triển, bạn có thể cài đặt Hadoop để chạy trên một máy tính cá nhân. Cách thông thường là tải bản phân phối Hadoop, sửa các file cấu hình `core-site.xml`, `hdfs-site.xml` để chỉ đường dẫn `fs.default.name` tới `hdfs://localhost:9000` và thiết lập `dfs.replication=1` (không cần sao lưu trên nhiều node). Sau đó khởi tạo NameNode (hdfs namenode -format) và khởi động dịch vụ. HDFS sẽ chạy ở chế độ pseudo-distributed, và bạn có thể thử các lệnh `hadoop fs -put, -ls, -cat` để tương tác như trên cluster thực.

Trên Docker: Apache cung cấp image Docker chính thức cho các thành phần của Hadoop (bao gồm HDFS) trên Docker Hub. Nhờ đó, bạn có thể chạy NameNode và DataNode như container riêng biệt. Tuy nhiên, HDFS yêu cầu lưu trữ bền vững (Persistent Storage). Vì Docker container thường không lưu trữ dữ liệu khi khởi động lại, nên cần map thư mục trên host hoặc volume tới container để NameNode lưu metadata và DataNode lưu dữ liệu. Trong Docker Compose hoặc Kubernetes, người ta thường dùng volume gắn kết tới host hoặc storage của máy chủ để đảm bảo dữ liệu không mất mát.

Trên Kubernetes: Việc chạy HDFS trên Kubernetes phức tạp hơn, vì Kubernetes vốn ưa chuộng các container “stateless” còn HDFS yêu cầu stateful (lưu dữ liệu trên ổ đĩa). Có ba cách phổ biến để triển khai HDFS trên Kubernetes: 

1) Dùng PersistentVolume (PV) kèm StatefulSet cho NameNode và DataNode; 
2) Dùng hostPath (ổ đĩa host) với NodeAffinity để ràng buộc pod DataNode trên máy nhất định; 
3) Kết hợp StatefulSet cho NameNode và DaemonSet cho DataNode. Điều quan trọng là phải dùng PV (hoặc hostPath) để cấp ổ đĩa thực cho HDFS. Ví dụ, ảnh dưới đây mô tả kiến trúc HDFS trên Kubernetes, với NameNode và DataNode chạy trong các pod riêng biệt nhưng sử dụng Persistent Volume và Service để giao tiếp ổn định:

Trên Kubernetes, ta thường bao bọc NameNode bằng một Service để có tên DNS/tĩnh ổn định, còn DataNode để trong StatefulSet để mỗi DataNode có danh tính “đặc trưng” (như datanode-0, datanode-1…) ngay cả khi pod được khởi động lại. Nhờ vậy, các DataNode luôn biết cách liên lạc với NameNode qua hostname cố định, và dữ liệu trên từng DataNode được giữ ổn định. Điều này phù hợp với thiết kế “mỗi DataNode là một pet, không phải cattle”. Nhìn chung, HDFS trên Kubernetes vẫn là một kiến trúc chu kỳ “động” và cần phải canh chỉnh kỹ lưỡng về storage.

## 🧩 Ví dụ ứng dụng HDFS trong xử lý Big Data

![hdfs-bigdata-pipeline](https://dytvr9ot2sszz.cloudfront.net/wp-content/uploads/2018/02/Kafka-Hadoop-Spark-Architecture-1024x666.png)
Để minh họa cách HDFS được dùng trong Big Data, hãy xem xét một kịch bản phân tích dữ liệu tiêu biểu:

- Bài toán viễn thông: Một công ty viễn thông cần phân tích hàng triệu bản ghi nhật ký cuộc gọi (call records) của khách hàng mỗi ngày để xác định mô hình sử dụng, dự đoán khách hàng có khả năng rời mạng (churn) hay không. Dữ liệu cuộc gọi này có thể nằm trong cơ sở dữ liệu quan hệ (Oracle, MySQL) hoặc log files từ thiết bị.
- Xây dựng pipeline: Dùng Sqoop để nhập (ingest) dữ liệu từ cơ sở dữ liệu vào Hadoop, lưu trữ dưới dạng file trên HDFS. Các bản ghi này được chứa trong các file lớn trên HDFS, mỗi file có thể nằm trên nhiều DataNode khác nhau (tùy block).
- Khám phá dữ liệu với Hive: HDFS lưu trữ dữ liệu thô, nhưng để truy vấn có cấu trúc, người ta dùng Apache Hive – một hệ thống kho dữ liệu (data warehouse) xây dựng trên Hadoop, cho phép truy vấn sử dụng ngôn ngữ SQL-like. Ví dụ, Hive có thể tạo bảng trên HDFS để tổng hợp số cuộc gọi theo tỉnh/thành, hay tính tổng phút gọi mỗi khách hàng. Theo OpenLogic: “Hive là hệ thống kho dữ liệu xây dựng trên Hadoop, cho phép truy vấn tập dữ liệu lớn dùng ngôn ngữ SQL-like”. Nhờ có Hive, các nhà phân tích không cần lập trình MapReduce tay để tính toán mà chỉ dùng câu lệnh SQL.
- Xử lý nâng cao với Spark: Đối với các thuật toán phức tạp (như machine learning) cần lặp qua dữ liệu nhiều lần, Apache Spark thường được chọn. Spark tương tác trực tiếp với HDFS: ta có thể tạo SparkSession trong PySpark, chỉ định `master=yarn` (để chạy trên YARN/Hadoop) rồi dùng lệnh như `spark.read.csv("hdfs://namenode:9000/data/logs.csv")` để nạp dữ liệu. Trong ví dụ mạng viễn thông, ta có thể dùng Spark MLlib hoặc PySpark ML để xây dựng mô hình dự đoán khách hàng rời mạng (churn prediction), đào tạo model trên dữ liệu HDFS. Spark có thể truy xuất, xử lý dữ liệu nhanh hơn rất nhiều so với MapReduce truyền thống (một số nguồn nói Spark nhanh gấp hàng chục lần Hive/MapReduce).
- Trực quan hóa: Kết quả sau khi xử lý (ví dụ số lượng khách hàng churn dự đoán theo khu vực) có thể lưu lại HDFS hoặc cơ sở dữ liệu và được hiển thị qua công cụ BI (Business Intelligence) như Tableau, PowerBI, Grafana… để lãnh đạo nắm tình hình.
Tóm lại, HDFS là lớp lưu trữ trung tâm trong một pipeline Big Data truyền thống. Ví dụ tại Learnomate, một use case cho công ty viễn thông có trình tự: Sqoop + HDFS + Hive + Spark ML + BI dashboard. Dữ liệu được đưa vào HDFS (bước 2), rồi được xử lý qua Hive (bước 3) và Spark (bước 4). Sự kết hợp này cho thấy HDFS linh hoạt: nó làm “kho dữ liệu thô” cho cả các công cụ SQL và các engine phân tích khác.
## ☁️ So sánh HDFS với Object Storage
![hdfs-vs-object-storage](https://static1.juicefs.com/images/Block_storage_vs._object_storage.original.png)
HDFS và Object Storage (ví dụ Amazon S3, Azure Blob Storage, MinIO) phục vụ mục đích lưu trữ nhưng theo cách khác nhau:
- Mô hình lưu trữ: HDFS là một hệ thống file system phân tán thực sự. Nó hỗ trợ thư mục, các phép tạo/xóa đổi tên file, và cung cấp giao diện tương tự POSIX (mặc dù đơn giản hóa một số phép như ghi đè). Trong HDFS, dữ liệu được lưu ở dạng file phân chia thành khối và đặt trong cây thư mục. Ngược lại, Object Storage lưu trữ dữ liệu dưới dạng đối tượng (object): mỗi object gồm khóa (tên, ID) và nội dung; không có hệ thống thư mục thực sự. Bạn không thể mở một “file” trong object storage theo cách thông thường; chỉ có hai thao tác PUT (tạo object) và GET (lấy object). Ví dụ, S3 chỉ trả về URL hoặc ID của object, và nếu muốn sửa một file, bạn phải tải lại toàn bộ object mới – không thể ghi đè một phần như trong HDFS. Tóm lại, HDFS cung cấp cấu trúc thư mục và tính nhất quán POSIX tương tự hệ thống file truyền thống, còn object storage là kho “phẳng”, không quản lý phân cấp thư mục.
- Độ nhất quán và truy cập: HDFS đảm bảo nhất quán cao (“one-copy semantics”): khi một file được ghi xong, tất cả client đều nhìn thấy nội dung mới ngay lập tức. Các thao tác như đổi tên, xóa được xem là nguyên tử – hoặc thành công hoàn toàn, hoặc không thực hiện gì. Object Storage thường áp dụng cuối cùng nhất quán (eventual consistency): việc tạo, xóa object có thể cần thời gian để lan tỏa. Điều này có nghĩa là ngay sau khi ghi, có thể có client vẫn thấy dữ liệu cũ trước khi cập nhật lan rộng. Mô hình này cho phép object storage đạt hiệu năng cao trong môi trường phân tán toàn cầu nhưng không đảm bảo mọi nút có cùng bản dữ liệu ngay lập tức.
- Khả năng chịu lỗi và sao lưu: HDFS sử dụng NameNode làm điểm điều phối chính. Điều này có nghĩa là NameNode ban đầu là một Single Point of Failure (Mất NameNode chính sẽ làm cluster ngưng trệ). (Ngày nay ta có NameNode thứ cấp/HA, nhưng vẫn là thành phần quản lý metadata trung tâm.) Data được sao lưu bằng cách nhân bản (replicate) trên nhiều DataNode. Object Storage như S3 thì khác: dữ liệu được tự động sao chép (có thể theo vùng địa lý) để đảm bảo khả năng chịu lỗi rất cao mà không cần người dùng quản lý. S3 và các dịch vụ tương tự không có một “master node” duy nhất; chúng thiết kế phân tán toàn cầu nên về cơ bản luôn sẵn sàng và bền bỉ mà không cần quan tâm đến node cụ thể nào hỏng.
- Phần cứng và chi phí: HDFS có thể xây dựng trên phần cứng commodity (ổ cứng thường, máy chủ xách tay). Bạn chỉ cần lắp ráp nhiều máy chủ loại bình dân để tăng dung lượng và tính toán. Object Storage thông thường xuất hiện trên các hệ thống lưu trữ chuyên dụng hoặc đám mây, với kiến trúc tách rời giữa lưu trữ và tính toán (decoupled). Ví dụ, Amazon S3 là dịch vụ đám mây, người dùng không cần biết hạ tầng, nhưng thực chất S3 chạy trên phần cứng lưu trữ hiệu năng cao. HDFS yêu cầu sao lưu dữ liệu nhân bản (mặc định gấp 2–3 lần dung lượng cần lưu), trong khi nhiều hệ thống Object Storage dùng erasure coding để tiết kiệm dung lượng. Nhìn chung, vận hành HDFS (đặc biệt trên on-premise) có thể tốn tài nguyên hơn (điện, làm mát, vận hành cluster), trong khi Object Storage tối ưu cho quy mô rất lớn với chi phí lưu trữ thấp trên đám mây.
- Loại dữ liệu phù hợp: HDFS rất phù hợp với dữ liệu cấu trúc (bảng dữ liệu, logs hệ thống) mà chúng ta xử lý theo hàng chục hàng trăm terabyte. Hệ thống thư mục của HDFS dễ hiểu và hỗ trợ ghi nối (append), thuận tiện với các luồng dữ liệu liên tục. Còn Object Storage thường được dùng cho dữ liệu phi cấu trúc (hình ảnh, video, tập tin đa phương tiện, hoặc các object bản ghi JSON lớn). Với object storage, toàn bộ object được tạo và xóa thành phần một (tập trung vào create/delete).
- Tóm gọn ưu – nhược: HDFS mạnh ở khả năng xử lý dữ liệu quy mô lớn theo mô hình truyền thống (write-once/read-many), tận dụng được tính cục bộ của dữ liệu trong cluster, và dễ dùng trong hệ sinh thái Hadoop. Tuy nhiên nó đòi hỏi quản trị cluster, và ít linh hoạt như dịch vụ đám mây. Object Storage thì ưu về độ mở rộng (không giới hạn về dung lượng), tính sẵn sàng và chi phí lưu trữ dài hạn thấp, nhưng không thay thế hoàn toàn file system truyền thống.

### Danh sách các khác biệt chính (HDFS vs Object Storage):
- Mô hình dữ liệu: HDFS là file system phân tán, hỗ trợ cây thư mục và các thao tác file; Object Storage lưu trong không gian phẳng của các object (không thư mục thực).
- Nhất quán (Consistency): HDFS cung cấp nhất quán dữ liệu mạnh (one-copy semantics); object storage thường chỉ cuối cùng nhất quán (eventual consistency).
- Khả năng chịu lỗi: HDFS có NameNode trung tâm (chỉ vài Primary Node để đảm nhận vai trò chính); object storage (như S3) phân tán toàn cầu, sao chép tự động giữa các vùng miền, ít phụ thuộc node đơn.
- Phần cứng / Chi phí: HDFS chạy tốt trên máy thường và nhân bản dữ liệu (tốn ~2-3× không gian); object storage thường dùng máy lưu trữ cao cấp hoặc đám mây với erasure coding, do đó hiệu quả lưu trữ hơn và chi phí thấp hơn cho quy mô lớn.
- Dữ liệu thích hợp: HDFS mạnh với dữ liệu cấu trúc/warehouse (có thể append), còn object storage mạnh với dữ liệu phi cấu trúc, tập trung thao tác CRUD trên object.

Nhìn chung, mỗi loại lưu trữ có điểm mạnh và điểm yếu riêng. HDFS thích hợp với các ứng dụng Big Data nội bộ (data warehouse lớn, log processing, bộ nhớ đệm của Spark/Hive) nơi cần hiệu năng cao trên các cluster lớn. Ngược lại, Object Storage thích hợp với kịch bản lưu trữ trên đám mây, nơi dữ liệu cực lớn (PB), dữ liệu không thay đổi thường xuyên, hoặc cần phân phối toàn cầu mà không muốn quản lý hạ tầng. Việc lựa chọn tùy thuộc vào yêu cầu cụ thể về hiệu năng, chi phí, tính sẵn sàng và mô hình truy cập dữ liệu.

## 🎯 Kết luận & Bài học kinh nghiệm
HDFS là một giải pháp xương sống của hệ sinh thái Hadoop, đóng vai trò như “ngân hàng” lưu trữ dữ liệu lớn cho các công cụ phân tích. Nó chứng minh rằng với thiết kế phù hợp (chia khối, nhân bản, và tính toán tại nguồn dữ liệu), chúng ta có thể xử lý lô dữ liệu hàng chục TB – PB một cách tin cậy ngay cả khi phần cứng “thường thường bậc trung”. Dù ngày nay xu hướng chuyển dịch sang đám mây và Object Storage đang mạnh (ví dụ AWS S3), HDFS vẫn giữ vai trò quan trọng trong các cụm dữ liệu on-premise hoặc hybrid.

### Từ HDFS, ta rút ra vài bài học “kinh nghiệm cuộc sống” thú vị

- Luôn chuẩn bị cho thất bại (Be fault-tolerant). Giống như HDFS nhân bản dữ liệu để đề phòng máy hỏng, trong công việc/đời sống cũng nên có kế hoạch dự phòng. Đừng bao giờ đặt “tất cả trứng vào một giỏ”: sao lưu dữ liệu quan trọng, phân quyền công việc, và thường xuyên đánh giá rủi ro.
- Đến gần với nguồn gốc của vấn đề (Move computation to data). HDFS khuyến khích di chuyển tính toán đến nơi dữ liệu cư trú để tối ưu hiệu năng. Tương tự, khi giải quyết vấn đề, ta nên hiểu rõ “nguồn gốc” và bối cảnh (data) của vấn đề, rồi đưa ra quyết định ngay tại đó (chứ không “kéo” dữ liệu/kiến thức đi xa, tránh lãng phí thời gian).
- Cộng tác và chia sẻ trách nhiệm. Một cluster HDFS hoạt động tốt nhờ “tập thể” NameNode + DataNode làm việc đồng bộ. Mỗi node có vai trò riêng nhưng cùng mục tiêu chung. Trong cuộc sống, bài học là teamwork: việc lớn nên phân chia, mỗi người “đóng góp một phần” để đạt được mục tiêu chung.
- Tính ổn định và đơn giản. HDFS đơn giản hóa nhiều yêu cầu phức tạp (ví dụ giảm thiểu các phép I/O rắc rối) để tập trung vào điểm mạnh nhất (xử lý file lớn). Cuộc sống cũng vậy, giữ mọi thứ đơn giản đôi khi hiệu quả hơn. Tối ưu mục tiêu chính và chấp nhận hy sinh một số tính “kinh điển” nếu giúp đạt hiệu suất cao hơn.
Như vậy, HDFS không chỉ là một công cụ công nghệ – nó còn dạy chúng ta về kiến trúc có khả năng chịu lỗi, làm việc nhóm, và luôn chuẩn bị cho những tình huống xấu nhất. Khi xây dựng hay vận hành hệ thống, hãy nhớ rằng “dữ liệu của bạn cũng cần người giữ an toàn”, giống như trong cuộc sống, thứ quan trọng cần lưu trữ và bảo vệ phải chu đáo!

> Thông tin trong bài được tổng hợp từ tài liệu và tài nguyên chính thức của Hadoop/HDFS, bài viết chuyên môn và kinh nghiệm của cộng đồng Big Data.

## 🔗 Tài liệu tham khảo
[HDFS Architecture Guide](https://hadoop.apache.org/docs/r1.2.1/hdfs_design.html)

[Apache Hadoop - Wikipedia](https://en.wikipedia.org/wiki/Apache_Hadoop)

[HDFS - Bigdata on Kubernetes](https://fatihmete.github.io/big-data-on-kubernetes/hdfs/)

[HDFS vs Cloud-based Object storage(S3)](https://luminousmen.com/post/hdfs-vs-cloud-based-object-storage-s3/)

[Single Node Setup](https://hadoop.apache.org/docs/r1.2.1/single_node_setup.html)

[Getting started with HDFS on Kubernetes](https://hasura.io/blog/getting-started-with-hdfs-on-kubernetes-a75325d4178c)

[Architecting Big Data Pipelines with Hadoop and HDFS | Become NO.1 expert with Learnomate Technologies](https://learnomate.org/architecting-big-data-pipelines-hadoop-hdfs/)

[Spark vs. Hadoop | OpenLogic](https://www.openlogic.com/blog/spark-vs-hadoop)

[Apache Spark with HDFS, HIVE and Hadoop (Code Practice Part 1) | by Tariqul Islam | Medium](https://tariqul-islam-rony.medium.com/apache-spark-with-hdfs-hive-and-hadoop-code-practice-part-1-7ad9b91b5afa)

[Object Storage vs. HDFS - Which is Better? | Triniti](https://www.triniti.com/data-warehousing-object-storage-vs-hdfs)

[HDFS vs Cloud-based Object storage(S3)](https://luminousmen.com/post/hdfs-vs-cloud-based-object-storage-s3/)

[Single Node Setup](https://hadoop.apache.org/docs/r1.2.1/single_node_setup.html)
[Getting started with HDFS on Kubernetes](https://hasura.io/blog/getting-started-with-hdfs-on-kubernetes-a75325d4178c)

[Architecting Big Data Pipelines with Hadoop and HDFS | Become NO.1 expert with Learnomate Technologies](https://learnomate.org/architecting-big-data-pipelines-hadoop-hdfs/)

[Spark vs. Hadoop | OpenLogic](https://www.openlogic.com/blog/spark-vs-hadoop)

[Apache Spark with HDFS, HIVE and Hadoop (Code Practice Part 1) | by Tariqul Islam | Medium](https://tariqul-islam-rony.medium.com/apache-spark-with-hdfs-hive-and-hadoop-code-practice-part-1-7ad9b91b5afa)

[Object Storage vs. HDFS - Which is Better? | Triniti](https://www.triniti.com/data-warehousing-object-storage-vs-hdfs)
