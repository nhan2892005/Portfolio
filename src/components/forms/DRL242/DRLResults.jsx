import { useState } from 'react';

const ScoreCard = ({ title, score, evidence }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const isImage = (link) => link && link.match(/\.(jpeg|jpg|png|webp|gif)$/i);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow relative">
      <h3 className="font-medium text-gray-700">{title}</h3>
      <div className="mt-2 flex justify-between items-center">
        <span className="text-2xl font-bold text-blue-600">{score}</span>

        {/* --- BẮT ĐẦU RENDER MINH CHỨNG --- */}
        {(() => {
          if (!evidence || (Array.isArray(evidence) && evidence.length === 0)) {
            return (
              <span className="text-sm text-gray-400 italic">
                Không có minh chứng
              </span>
            );
          }

          if (Array.isArray(evidence)) {
            return (
              <div className="flex flex-col items-end">
                {evidence.map((link, idx) => (
                  <div
                    key={idx}
                    className="relative group text-sm mt-1"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7l-5 5m0 0l-5-5m5 5v12" />
                      </svg>
                      Minh chứng {idx + 1}
                    </a>

                    {hoveredIndex === idx && isImage(link) && (
                      <div className="absolute -left-64 top-0 z-50 w-60 h-auto border border-gray-300 shadow-xl bg-white rounded">
                        <img src={link} alt={`Minh chứng ${idx + 1}`} className="rounded w-full object-contain" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          }

          return (
            <div
              className="relative group"
              onMouseEnter={() => setHoveredIndex(0)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <a
                href={evidence}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 flex items-center"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7l-5 5m0 0l-5-5m5 5v12" />
                </svg>
                Minh chứng
              </a>

              {hoveredIndex === 0 && isImage(evidence) && (
                <div className="absolute -left-64 top-0 z-50 w-60 h-auto border border-gray-300 shadow-xl bg-white rounded">
                  <img src={evidence} alt="Minh chứng" className="rounded w-full object-contain" />
                </div>
              )}
            </div>
          );
        })()}
        {/* --- KẾT THÚC RENDER MINH CHỨNG --- */}
      </div>
    </div>
  );
};

const parseEvidence = (evidenceStr) => {
  if (!evidenceStr) return null;
  const parts = evidenceStr.split(/\n+/).map(s => s.trim()).filter(Boolean);
  return parts.length > 1 ? parts : parts[0];
};

const DRLResults = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Không tìm thấy dữ liệu</p>
      </div>
    );
  }

  const result = data[0];
  const scores = [
    {
      title: "1. Ý thức tham gia học tập",
      score: result["1. Ý thức tham gia học tập"],
    },
    {
      title: "2. Ý thức chấp hành nội quy, quy chế",
      score: result["2. Ý thức chấp hành nội quy, quy chế, quy định trong nhà trường"],
    },
    {
      title: "3. Ý thức tham gia hoạt động",
      score: result["3. Ý thức tham gia các hoạt động chính trị, xã hội, văn hoá, văn nghệ, thể thao, phòng chống tội phạm và các tệ nạn xã hội."],
      evidence: parseEvidence(result["Minh chứng mục 3"]),
    },
    {
      title: "4. Ý thức công dân",
      score: result["4. Ý thức công dân, quan hệ cộng đồng"],
      evidence: parseEvidence(result["Minh chứng mục 4"]),
    },
    {
      title: "5. Ý thức tham gia công tác lớp",
      score: result["5. Ý thức và kết quả khi tham gia công tác cán bộ lớp, các đoàn thể, tổ chức trong trường"],
      evidence: parseEvidence(result["Minh chứng mục 5"]),
    },
    {
      title: "6. Điểm thưởng đặc biệt",
      score: result["6. Điểm thưởng đặc biệt"],
      evidence: parseEvidence(result["Minh chứng mục 6"]),
    },
  ];

  return (
    <div className="bg-white p-5 rounded-lg shadow-md">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {result["Họ và Tên - Họ và Tên lót (VD: Tên Nguyễn Văn A, nhập: Nguyễn Văn)"]} {result["Họ và Tên - Tên (VD: Tên Nguyễn Văn A, nhập: A)"]}
              </h2>
              <p className="text-gray-500">MSSV: {result["Mã số sinh viên"]}</p>
              <p className="text-gray-500">{result["Email (@hcmut.edu.vn)"]}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {result["Tổng số điểm rèn luyện tự đánh giá của bạn"]}
              </div>
              <div className="text-sm text-gray-500">Tổng điểm</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scores.map((score, index) => (
              <ScoreCard key={index} {...score} />
            ))}
          </div>

          {result["Thắc mắc của sinh viên"] && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Thắc mắc</h3>
              <p className="text-gray-600">{result["Thắc mắc của sinh viên"]}</p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Thông tin nộp</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Thời gian nộp</p>
              <p>{new Date(result["Submission Date"]).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Cập nhật lần cuối</p>
              <p>{new Date(result["Last Update Date"]).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500">IP Address</p>
              <p>{result["Submission IP"]}</p>
            </div>
            <div>
              <p className="text-gray-500">Submission ID</p>
              <p>{result["Submission ID"]}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DRLResults;
