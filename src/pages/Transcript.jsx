import React, { useState, useMemo } from "react";
import transcriptData from "../data/diem.json";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const gradeToGPA = {
  "A+": 4.0,
  "A": 4.0,
  "B+": 3.5,
  "B": 3.0,
  "C+": 2.5,
  "C": 2.0,
  "D+": 1.5,
  "D": 1.0,
  "F": 0.0,
};

const Transcript = () => {
  const { diemSinhVien, khoiKienThuc } = transcriptData.data;
  
  // State cho search và filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKKT, setSelectedKKT] = useState("");
  const [minScore, setMinScore] = useState("");
  const [maxScore, setMaxScore] = useState("");
  const [minCredits, setMinCredits] = useState("");
  const [maxCredits, setMaxCredits] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320); // Default width
  const [isResizing, setIsResizing] = useState(false);

  const scoreMap = diemSinhVien.reduce((acc, item) => {
    acc[item.MONHOCID] = item;
    return acc;
  }, {});

  let totalCredits = 0;
  let totalWeightedGPA = 0;
  let totalWeightedScore10 = 0;

  const groupedByKKT = {};

  khoiKienThuc.forEach((course) => {
    const score = scoreMap[course.MONHOCID];
    let diemChu = "--";
    let diemSo = null;
    let diemHe4 = null;

    if (score) {
      diemChu = score.DIEMCHU;
      diemSo = score.DIEMSO;
      diemHe4 = gradeToGPA[diemChu] ?? "--";

      if (course.SOTC > 0 && typeof diemHe4 === "number" && typeof diemSo === "number") {
        totalCredits += course.SOTC;
        totalWeightedGPA += diemHe4 * course.SOTC;
        totalWeightedScore10 += diemSo * course.SOTC;
      }
    }

    const mon = {
      ...course,
      diemChu,
      diemSo,
      diemHe4,
    };

    if (!groupedByKKT[course.TENKHOIKIENTHUC]) {
      groupedByKKT[course.TENKHOIKIENTHUC] = [];
    }
    groupedByKKT[course.TENKHOIKIENTHUC].push(mon);
  });

  // Lấy danh sách unique khối kiến thức để làm filter options
  const uniqueKKT = [...new Set(khoiKienThuc.map(course => course.TENKHOIKIENTHUC))];

  // Filtered data dựa trên search và filter
  const filteredGroupedByKKT = useMemo(() => {
    const filtered = {};
    
    Object.entries(groupedByKKT).forEach(([tenKKT, courses]) => {
      // Filter theo khối kiến thức
      if (selectedKKT && tenKKT !== selectedKKT) {
        return;
      }

      const filteredCourses = courses.filter(course => {
        // Search trong mã môn, tên môn
        const matchesSearch = !searchTerm || 
          course.MAMONHOC?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.TENMONHOC?.toLowerCase().includes(searchTerm.toLowerCase());

        // Filter theo điểm số
        const diemSo = course.diemSo;
        const matchesScore = (!minScore || (diemSo !== null && diemSo >= parseFloat(minScore))) &&
                           (!maxScore || (diemSo !== null && diemSo <= parseFloat(maxScore)));

        // Filter theo số tín chỉ
        const matchesCredits = (!minCredits || course.SOTC >= parseInt(minCredits)) &&
                              (!maxCredits || course.SOTC <= parseInt(maxCredits));

        return matchesSearch && matchesScore && matchesCredits;
      });

      if (filteredCourses.length > 0) {
        filtered[tenKKT] = filteredCourses;
      }
    });

    return filtered;
  }, [groupedByKKT, searchTerm, selectedKKT, minScore, maxScore, minCredits, maxCredits]);

  const avgGPA = (totalWeightedGPA / totalCredits).toFixed(2);
  const avg10 = (totalWeightedScore10 / totalCredits).toFixed(2);

  // Phân tích dữ liệu cho biểu đồ
  const gradeAnalysis = useMemo(() => {
    const gradeCount = { "A+": 0, "A": 0, "B+": 0, "B": 0, "C+": 0, "C": 0, "D+": 0, "D": 0, "F": 0 };
    const scoreRanges = { "9.0-10": 0, "8.0-8.9": 0, "7.0-7.9": 0, "6.0-6.9": 0, "5.0-5.9": 0, "<5.0": 0 };
    const kktAnalysis = {};
    const creditAnalysis = {
      totalRequired: 128, // Từ thông tin CTĐT
      totalCompleted: 0,
      totalRemaining: 0,
      creditsByGrade: { "A+": 0, "A": 0, "B+": 0, "B": 0, "C+": 0, "C": 0, "D+": 0, "D": 0, "F": 0 },
      creditsByKKT: {},
      progressByKKT: {}
    };
    
    Object.values(groupedByKKT).forEach(courses => {
      courses.forEach(course => {
        // Kiểm tra xem có phải môn xét điểm không (điểm số <= 10)
        const isGradedCourse = course.diemSo !== null && course.diemSo <= 10;
        
        // Đếm điểm chữ (chỉ với môn xét điểm)
        if (course.diemChu && course.diemChu !== "--" && isGradedCourse) {
          gradeCount[course.diemChu] = (gradeCount[course.diemChu] || 0) + 1;
          // Đếm tín chỉ theo điểm chữ (chỉ với môn xét điểm)
          creditAnalysis.creditsByGrade[course.diemChu] = (creditAnalysis.creditsByGrade[course.diemChu] || 0) + course.SOTC;
        }
        
        // Đếm theo khoảng điểm (chỉ với môn xét điểm)
        if (isGradedCourse) {
          const score = course.diemSo;
          if (score >= 9.0 && score <= 10) scoreRanges["9.0-10"]++;
          else if (score >= 8.0) scoreRanges["8.0-8.9"]++;
          else if (score >= 7.0) scoreRanges["7.0-7.9"]++;
          else if (score >= 6.0) scoreRanges["6.0-6.9"]++;
          else if (score >= 5.0) scoreRanges["5.0-5.9"]++;
          else scoreRanges["<5.0"]++;
        }
        
        // Phân tích theo khối kiến thức
        const kkt = course.TENKHOIKIENTHUC;
        if (!kktAnalysis[kkt]) {
          kktAnalysis[kkt] = { count: 0, totalScore: 0, avgScore: 0, gradedCount: 0 };
        }
        kktAnalysis[kkt].count++; // Tổng số môn (bao gồm cả không xét điểm)
        
        // Chỉ tính điểm TB với môn xét điểm
        if (isGradedCourse) {
          kktAnalysis[kkt].totalScore += course.diemSo;
          kktAnalysis[kkt].gradedCount++; // Số môn thực sự xét điểm
        }

        // Phân tích tín chỉ theo khối kiến thức (tất cả môn, kể cả không xét điểm)
        if (!creditAnalysis.creditsByKKT[kkt]) {
          creditAnalysis.creditsByKKT[kkt] = { completed: 0, total: 0 };
        }
        creditAnalysis.creditsByKKT[kkt].total += course.SOTC;
        
        // Tín chỉ hoàn thành: môn có điểm chữ (bao gồm cả không xét điểm nếu có điểm chữ)
        if (course.diemChu && course.diemChu !== "--") {
          creditAnalysis.creditsByKKT[kkt].completed += course.SOTC;
        }
      });
    });

    // Tính điểm trung bình cho mỗi khối kiến thức (chỉ với môn xét điểm)
    Object.keys(kktAnalysis).forEach(kkt => {
      if (kktAnalysis[kkt].gradedCount > 0 && kktAnalysis[kkt].totalScore > 0) {
        kktAnalysis[kkt].avgScore = (kktAnalysis[kkt].totalScore / kktAnalysis[kkt].gradedCount).toFixed(2);
      } else {
        kktAnalysis[kkt].avgScore = 0; // Không có điểm hoặc chưa có môn nào xét điểm
      }
    });

    // Tính tổng tín chỉ đã hoàn thành và còn lại
    creditAnalysis.totalCompleted = totalCredits;
    creditAnalysis.totalRemaining = Math.max(0, creditAnalysis.totalRequired - creditAnalysis.totalCompleted);

    // Tính tỷ lệ hoàn thành cho từng khối kiến thức
    Object.keys(creditAnalysis.creditsByKKT).forEach(kkt => {
      const data = creditAnalysis.creditsByKKT[kkt];
      creditAnalysis.progressByKKT[kkt] = {
        ...data,
        percentage: data.total > 0 ? ((data.completed / data.total) * 100).toFixed(1) : 0
      };
    });

    return { gradeCount, scoreRanges, kktAnalysis, creditAnalysis };
  }, [groupedByKKT, totalCredits]);

  // Chuẩn bị dữ liệu cho biểu đồ
  const pieData = Object.entries(gradeAnalysis.gradeCount)
    .filter(([_, count]) => count > 0)
    .map(([grade, count]) => ({ name: grade, value: count }));

  const barData = Object.entries(gradeAnalysis.scoreRanges)
    .map(([range, count]) => ({ range, count }));

  const kktData = Object.entries(gradeAnalysis.kktAnalysis)
    .filter(([kkt, data]) => data.count > 0) // Chỉ lấy khối có môn học
    .map(([kkt, data]) => ({ 
      name: kkt.length > 20 ? kkt.substring(0, 20) + "..." : kkt, 
      fullName: kkt,
      count: data.count, // Tổng số môn (bao gồm cả không xét điểm)
      gradedCount: data.gradedCount, // Số môn xét điểm
      avgScore: parseFloat(data.avgScore) || 0,
      hasScore: data.gradedCount > 0 && data.totalScore > 0 // Kiểm tra có môn xét điểm không
    }))
    .sort((a, b) => b.avgScore - a.avgScore);

  // Dữ liệu cho biểu đồ tín chỉ
  const creditPieData = [
    { name: "Đã hoàn thành", value: gradeAnalysis.creditAnalysis.totalCompleted, color: "#10B981" },
    { name: "Còn lại", value: gradeAnalysis.creditAnalysis.totalRemaining, color: "#EF4444" }
  ];

  const creditByGradeData = Object.entries(gradeAnalysis.creditAnalysis.creditsByGrade)
    .filter(([_, credits]) => credits > 0)
    .map(([grade, credits]) => ({ grade, credits }));

  const creditProgressData = Object.entries(gradeAnalysis.creditAnalysis.progressByKKT)
    .filter(([kkt, data]) => data.total > 0) // Chỉ lấy khối có tín chỉ
    .map(([kkt, data]) => ({
      name: kkt.length > 15 ? kkt.substring(0, 15) + "..." : kkt,
      fullName: kkt,
      completed: data.completed,
      total: data.total,
      remaining: data.total - data.completed,
      percentage: parseFloat(data.percentage)
    }))
    .sort((a, b) => b.percentage - a.percentage);

  // Màu sắc cho biểu đồ
  const COLORS = {
    "A+": "#10B981", "A": "#059669", "B+": "#3B82F6", "B": "#2563EB", 
    "C+": "#F59E0B", "C": "#D97706", "D+": "#EF4444", "D": "#DC2626", "F": "#991B1B"
  };

  // Xử lý resize sidebar
  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e) => {
    if (!isResizing) return;
    
    const newWidth = e.clientX;
    if (newWidth >= 280 && newWidth <= 800) { // Min 280px, Max 800px
      setSidebarWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  // Add event listeners for resize
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } overflow-y-auto`}
        style={{ width: `${sidebarWidth}px` }}
      >
        <div className="p-4" style={{ userSelect: isResizing ? 'none' : 'auto' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">📊 Phân tích điểm</h2>
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500">
                {sidebarWidth}px
              </div>
              <button
                onClick={() => setSidebarWidth(320)}
                className="p-1 hover:bg-gray-100 rounded text-xs"
                title="Reset về kích thước mặc định (320px)"
              >
                ↔️
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Hướng dẫn đọc biểu đồ */}
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">💡 Hướng dẫn đọc biểu đồ</h3>
            <div className="space-y-2 text-xs text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-medium">📊 Chất lượng:</span>
                <span>Điểm TB theo khối → Bạn học tốt ở khối nào (chỉ tính môn xét điểm)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-medium">📈 Tiến độ:</span>
                <span>Tín chỉ theo khối → Bạn đã hoàn thành bao nhiêu % ở mỗi khối</span>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <span className="text-purple-600 font-medium">🎯 Mẹo:</span>
                <span> Khối có điểm TB cao nhưng tiến độ thấp = cần học thêm môn</span>
              </div>
              <div className="mt-2 pt-1 border-t border-gray-300">
                <span className="text-orange-600 font-medium">⚠️ Lưu ý:</span>
                <span> Môn không xét điểm (điểm {'>'}10) như thực tập được loại khỏi phân tích chất lượng</span>
              </div>
            </div>
          </div>

          {/* Biểu đồ tròn - Phân bố điểm chữ */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Phân bố điểm chữ</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || "#8884d8"} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Biểu đồ cột - Phân bố điểm số */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Phân bố theo khoảng điểm</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="range" 
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Biểu đồ cột - Điểm TB theo khối kiến thức */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              📊 Điểm TB theo khối kiến thức
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Chất lượng</span>
            </h3>
            <div className="text-sm text-gray-600 mb-3 bg-blue-50 p-3 rounded-lg">
              <div className="font-medium text-blue-800">Ý nghĩa:</div>
              <div>• Điểm trung bình của các môn học <strong>xét điểm</strong> trong từng khối kiến thức (thang điểm 10)</div>
              <div>• Phản ánh <strong>chất lượng học tập</strong> - bạn học tốt ở khối nào</div>
              <div>• <strong>Loại trừ</strong> môn không xét điểm (điểm {'>'}10) như thực tập, seminar</div>
              <div>• Chỉ tính các môn đã có điểm và điểm ≤ 10</div>
            </div>
            {kktData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={kktData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 10]} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 10 }}
                    width={100}
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                            <p className="font-semibold text-gray-800 mb-2">{data.fullName}</p>
                            <div className="space-y-1">
                              <p className="text-blue-600 font-medium">
                                📊 Điểm TB: {data.avgScore === 0 ? 'Chưa có điểm' : `${data.avgScore}/10`}
                              </p>
                              <p className="text-gray-600">📚 Tổng môn: {data.count}</p>
                              <p className="text-green-600">🎯 Môn xét điểm: {data.gradedCount}</p>
                              <p className="text-orange-600">📋 Môn không xét điểm: {data.count - data.gradedCount}</p>
                            </div>
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p className="text-xs text-gray-500">💡 Chỉ tính điểm TB với môn xét điểm (điểm ≤ 10)</p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="avgScore" 
                    fill={(entry) => entry.hasScore ? "#10B981" : "#9CA3AF"}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📊</div>
                <p>Chưa có dữ liệu điểm để hiển thị</p>
                <p className="text-xs mt-1">Cần có ít nhất một môn đã có điểm</p>
              </div>
            )}
          </div>

          {/* Biểu đồ tròn - Tiến độ tín chỉ */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Tiến độ tín chỉ tổng thể</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={creditPieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {creditPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 text-center">
              <p className="text-sm text-gray-600">
                Tiến độ: {((gradeAnalysis.creditAnalysis.totalCompleted / gradeAnalysis.creditAnalysis.totalRequired) * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Biểu đồ cột - Tín chỉ theo điểm chữ */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Phân bố tín chỉ theo điểm</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={creditByGradeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} tín chỉ`, 'Số tín chỉ']} />
                <Bar dataKey="credits" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Biểu đồ tiến độ theo khối kiến thức */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              📈 Tiến độ theo khối kiến thức
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Tiến độ</span>
            </h3>
            <div className="text-sm text-gray-600 mb-3 bg-green-50 p-3 rounded-lg">
              <div className="font-medium text-green-800">Ý nghĩa:</div>
              <div>• Số tín chỉ <strong>đã hoàn thành</strong> (xanh) và <strong>còn lại</strong> (đỏ) cho từng khối kiến thức</div>
              <div>• Phản ánh <strong>tiến độ học tập</strong> - bạn đã hoàn thành bao nhiêu % ở mỗi khối</div>
              <div>• Tính cả môn đã có điểm và chưa có điểm (miễn là đã đăng ký học)</div>
            </div>
            {creditProgressData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={creditProgressData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 9 }}
                    width={120}
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const item = creditProgressData.find(d => d.name === label);
                        if (item) {
                          return (
                            <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                              <p className="font-semibold text-gray-800 mb-2">{item.fullName}</p>
                              <div className="space-y-1">
                                <p className="text-green-600 font-medium">
                                  ✅ Đã hoàn thành: {item.completed} tín chỉ
                                </p>
                                <p className="text-red-600">
                                  ⏳ Còn lại: {item.remaining} tín chỉ
                                </p>
                                <p className="text-blue-600">
                                  📊 Tổng cộng: {item.total} tín chỉ
                                </p>
                                <p className="text-purple-600 font-medium">
                                  🎯 Tiến độ: {item.percentage}%
                                </p>
                              </div>
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <p className="text-xs text-gray-500">💡 Thể hiện tiến độ hoàn thành khối này</p>
                              </div>
                            </div>
                          );
                        }
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="completed" stackId="a" fill="#10B981" name="Đã hoàn thành" />
                  <Bar dataKey="remaining" stackId="a" fill="#EF4444" name="Còn lại" />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📈</div>
                <p>Chưa có dữ liệu tín chỉ để hiển thị</p>
                <p className="text-xs mt-1">Cần có ít nhất một khối kiến thức có tín chỉ</p>
              </div>
            )}
          </div>

          {/* Thống kê so sánh chất lượng vs tiến độ */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">📈 So sánh Chất lượng vs Tiến độ</h3>
            
            {/* Top 3 khối có điểm TB cao nhất */}
            <div className="bg-blue-50 p-3 rounded-lg mb-3">
              <h4 className="font-medium text-blue-800 mb-2">🏆 Top khối điểm TB cao nhất</h4>
              <div className="space-y-1 text-sm">
                {kktData
                  .filter(item => item.hasScore && item.avgScore > 0)
                  .sort((a, b) => b.avgScore - a.avgScore)
                  .slice(0, 3)
                  .map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-700">
                        #{index + 1} {item.name}
                      </span>
                      <span className="font-semibold text-blue-600">
                        {item.avgScore}/10
                      </span>
                    </div>
                  ))}
                {kktData.filter(item => item.hasScore && item.avgScore > 0).length === 0 && (
                  <div className="text-gray-500 text-center py-2">Chưa có dữ liệu điểm</div>
                )}
              </div>
            </div>

            {/* Top 3 khối có tiến độ cao nhất */}
            <div className="bg-green-50 p-3 rounded-lg mb-3">
              <h4 className="font-medium text-green-800 mb-2">📊 Top khối tiến độ cao nhất</h4>
              <div className="space-y-1 text-sm">
                {creditProgressData
                  .sort((a, b) => b.percentage - a.percentage)
                  .slice(0, 3)
                  .map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-700">
                        #{index + 1} {item.name}
                      </span>
                      <span className="font-semibold text-green-600">
                        {item.percentage}%
                      </span>
                    </div>
                  ))}
                {creditProgressData.length === 0 && (
                  <div className="text-gray-500 text-center py-2">Chưa có dữ liệu tín chỉ</div>
                )}
              </div>
            </div>

            {/* Khuyến nghị */}
            <div className="bg-purple-50 p-3 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">💡 Gợi ý cải thiện</h4>
              <div className="space-y-1 text-sm text-gray-700">
                {(() => {
                  const topQualityKKT = kktData
                    .filter(item => item.hasScore && item.avgScore > 0)
                    .sort((a, b) => b.avgScore - a.avgScore)[0];
                  
                  const topProgressKKT = creditProgressData
                    .sort((a, b) => b.percentage - a.percentage)[0];
                  
                  const lowProgressKKT = creditProgressData
                    .filter(item => item.percentage < 50)
                    .sort((a, b) => a.percentage - b.percentage);

                  return (
                    <>
                      {topQualityKKT && (
                        <div>✨ Điểm mạnh: {topQualityKKT.fullName} (TB: {topQualityKKT.avgScore}/10)</div>
                      )}
                      {topProgressKKT && (
                        <div>🎯 Tiến độ tốt nhất: {topProgressKKT.fullName} ({topProgressKKT.percentage}%)</div>
                      )}
                      {lowProgressKKT.length > 0 && (
                        <div>⚠️ Cần tăng cường: {lowProgressKKT[0].fullName} ({lowProgressKKT[0].percentage}%)</div>
                      )}
                      {!topQualityKKT && !topProgressKKT && (
                        <div className="text-gray-500">Chưa đủ dữ liệu để đưa ra gợi ý</div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Thống kê chi tiết */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">📊 Thống kê tổng quan</h3>
            
            {/* Thống kê về điểm */}
            <div className="space-y-2 text-sm mb-4">
              <h4 className="font-medium text-gray-700">📊 Thống kê điểm</h4>
              <div className="flex justify-between">
                <span>Tổng số môn có điểm:</span>
                <span className="font-semibold">{pieData.reduce((sum, item) => sum + item.value, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Số môn điểm A+/A:</span>
                <span className="font-semibold text-green-600">
                  {(gradeAnalysis.gradeCount["A+"] || 0) + (gradeAnalysis.gradeCount["A"] || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Số môn điểm B+/B:</span>
                <span className="font-semibold text-blue-600">
                  {(gradeAnalysis.gradeCount["B+"] || 0) + (gradeAnalysis.gradeCount["B"] || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Số môn điểm C trở xuống:</span>
                <span className="font-semibold text-orange-600">
                  {(gradeAnalysis.gradeCount["C+"] || 0) + (gradeAnalysis.gradeCount["C"] || 0) + 
                   (gradeAnalysis.gradeCount["D+"] || 0) + (gradeAnalysis.gradeCount["D"] || 0) + 
                   (gradeAnalysis.gradeCount["F"] || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tỷ lệ điểm giỏi (A+/A):</span>
                <span className="font-semibold text-green-600">
                  {pieData.length > 0 ? 
                    (((gradeAnalysis.gradeCount["A+"] || 0) + (gradeAnalysis.gradeCount["A"] || 0)) / 
                     pieData.reduce((sum, item) => sum + item.value, 0) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>

            {/* Thống kê về tín chỉ */}
            <div className="space-y-2 text-sm border-t pt-4">
              <h4 className="font-medium text-gray-700">🎓 Thống kê tín chỉ</h4>
              <div className="flex justify-between">
                <span>Tổng tín chỉ CTĐT:</span>
                <span className="font-semibold">{gradeAnalysis.creditAnalysis.totalRequired}</span>
              </div>
              <div className="flex justify-between">
                <span>Tín chỉ đã tích lũy:</span>
                <span className="font-semibold text-green-600">{gradeAnalysis.creditAnalysis.totalCompleted}</span>
              </div>
              <div className="flex justify-between">
                <span>Tín chỉ còn lại:</span>
                <span className="font-semibold text-red-600">{gradeAnalysis.creditAnalysis.totalRemaining}</span>
              </div>
              <div className="flex justify-between">
                <span>Tiến độ hoàn thành:</span>
                <span className="font-semibold text-blue-600">
                  {((gradeAnalysis.creditAnalysis.totalCompleted / gradeAnalysis.creditAnalysis.totalRequired) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tín chỉ điểm A+/A:</span>
                <span className="font-semibold text-green-600">
                  {(gradeAnalysis.creditAnalysis.creditsByGrade["A+"] || 0) + (gradeAnalysis.creditAnalysis.creditsByGrade["A"] || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tín chỉ điểm B+/B:</span>
                <span className="font-semibold text-blue-600">
                  {(gradeAnalysis.creditAnalysis.creditsByGrade["B+"] || 0) + (gradeAnalysis.creditAnalysis.creditsByGrade["B"] || 0)}
                </span>
              </div>
            </div>

            {/* Top khối kiến thức hoàn thành tốt nhất */}
            <div className="space-y-2 text-sm border-t pt-4">
              <h4 className="font-medium text-gray-700">🏆 Top khối kiến thức hoàn thành</h4>
              <div className="text-xs text-gray-500 mb-2">
                Xếp hạng theo tỷ lệ % tín chỉ đã hoàn thành
              </div>
              {creditProgressData.slice(0, 5).map((kkt, index) => (
                <div key={kkt.fullName} className="flex justify-between items-center py-1">
                  <div className="flex-1">
                    <span className="text-xs font-medium">{index + 1}. {kkt.name}</span>
                    <div className="text-xs text-gray-500">
                      {kkt.completed}/{kkt.total} tín chỉ
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${kkt.percentage}%`,
                          backgroundColor: kkt.percentage >= 80 ? '#10B981' : kkt.percentage >= 60 ? '#3B82F6' : '#F59E0B'
                        }}
                      ></div>
                    </div>
                    <span className="font-semibold text-xs w-12 text-right" style={{
                      color: kkt.percentage >= 80 ? '#10B981' : kkt.percentage >= 60 ? '#3B82F6' : '#F59E0B'
                    }}>
                      {kkt.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Thống kê điểm TB theo khối */}
            <div className="space-y-2 text-sm border-t pt-4">
              <h4 className="font-medium text-gray-700">📊 Top điểm trung bình</h4>
              <div className="text-xs text-gray-500 mb-2">
                Khối kiến thức có điểm TB cao nhất
              </div>
              {kktData.filter(item => item.avgScore > 0).slice(0, 3).map((kkt, index) => (
                <div key={kkt.fullName} className="flex justify-between items-center">
                  <span className="text-xs">{index + 1}. {kkt.name}</span>
                  <span className="font-semibold text-xs text-green-600">
                    {kkt.avgScore}/10
                  </span>
                </div>
              ))}
              {kktData.filter(item => item.avgScore > 0).length === 0 && (
                <div className="text-xs text-gray-400 italic">Chưa có dữ liệu điểm</div>
              )}
            </div>
          </div>
        </div>

        {/* Resize handle */}
        <div
          className={`absolute top-0 right-0 w-2 h-full cursor-col-resize group ${
            isResizing ? 'bg-blue-500' : 'hover:bg-gray-300'
          }`}
          onMouseDown={handleMouseDown}
          title="Kéo để thay đổi kích thước (280px - 600px)"
        >
          {/* Visual indicator */}
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-4 h-12 bg-gray-400 group-hover:bg-blue-500 rounded-l-lg flex items-center justify-center transition-colors">
            <div className="flex flex-col space-y-1">
              <div className="w-0.5 h-3 bg-white rounded"></div>
              <div className="w-0.5 h-3 bg-white rounded"></div>
            </div>
          </div>
          
          {/* Resize instruction tooltip */}
          {isResizing && (
            <div className="absolute top-4 right-6 bg-black text-white text-xs px-2 py-1 rounded shadow-lg">
              {sidebarWidth}px
            </div>
          )}
        </div>
      </div>

      {/* Overlay khi sidebar mở */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
          style={{ 
            left: sidebarOpen ? `${sidebarWidth}px` : '0px',
            transition: 'left 0.3s ease-in-out'
          }}
        ></div>
      )}

      {/* Main content */}
      <div 
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'ml-0 md:ml-0' : 'ml-0'
        }`}
        style={{
          marginLeft: sidebarOpen ? `${sidebarWidth}px` : '0px',
          transition: 'margin-left 0.3s ease-in-out'
        }}
      >
        <div className="p-4">
          {/* Header với nút toggle sidebar */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Bảng điểm sinh viên</h1>
            <div className="flex items-center gap-2">
              {sidebarOpen && (
                <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Sidebar: {sidebarWidth}px {sidebarWidth !== 320 && '(Tùy chỉnh)'}
                </div>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                📊 {sidebarOpen ? 'Ẩn phân tích' : 'Xem phân tích'}
              </button>
            </div>
          </div>
          
          {/* Thống kê tổng quan */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Tổng số tín chỉ tích lũy</p>
                <p className="text-xl font-bold text-blue-600">{totalCredits}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Điểm trung bình hệ 4</p>
                <p className="text-xl font-bold text-green-600">{avgGPA}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Điểm trung bình hệ 10</p>
                <p className="text-xl font-bold text-purple-600">{avg10}</p>
              </div>
            </div>
          </div>

          {/* Search và Filter */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">🔍 Tìm kiếm và Lọc</h2>
            
            {/* Search bar */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Tìm kiếm mã môn hoặc tên môn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Khối kiến thức filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Khối kiến thức</label>
                <select
                  value={selectedKKT}
                  onChange={(e) => setSelectedKKT(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tất cả</option>
                  {uniqueKKT.map(kkt => (
                    <option key={kkt} value={kkt}>{kkt}</option>
                  ))}
                </select>
              </div>

              {/* Điểm số filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Điểm số</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Từ"
                    value={minScore}
                    onChange={(e) => setMinScore(e.target.value)}
                    className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="10"
                    step="0.1"
                  />
                  <input
                    type="number"
                    placeholder="Đến"
                    value={maxScore}
                    onChange={(e) => setMaxScore(e.target.value)}
                    className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="10"
                    step="0.1"
                  />
                </div>
              </div>

              {/* Số tín chỉ filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số tín chỉ</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Từ"
                    value={minCredits}
                    onChange={(e) => setMinCredits(e.target.value)}
                    className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                  <input
                    type="number"
                    placeholder="Đến"
                    value={maxCredits}
                    onChange={(e) => setMaxCredits(e.target.value)}
                    className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Clear filters button */}
            <div className="mt-4">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedKKT("");
                  setMinScore("");
                  setMaxScore("");
                  setMinCredits("");
                  setMaxCredits("");
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                🗑️ Xóa bộ lọc
              </button>
            </div>
          </div>

          {/* Kết quả */}
          {Object.keys(filteredGroupedByKKT).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">Không tìm thấy kết quả phù hợp</p>
            </div>
          ) : (
            Object.entries(filteredGroupedByKKT).map(([tenKKT, courses]) => (
              <div key={tenKKT} className="mb-8">
                <h2 className="text-xl font-semibold mb-2">📚 {tenKKT} ({courses.length} môn)</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto border border-gray-300">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border px-4 py-2 text-left">Mã môn</th>
                        <th className="border px-4 py-2 text-left">Tên môn</th>
                        <th className="border px-4 py-2">Số TC</th>
                        <th className="border px-4 py-2">Điểm chữ</th>
                        <th className="border px-4 py-2">Điểm số</th>
                        <th className="border px-4 py-2">Điểm hệ 4</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course, index) => (
                        <tr key={index} className="even:bg-gray-50 hover:bg-blue-50 transition-colors">
                          <td className="border px-4 py-2 font-mono">{course.MAMONHOC}</td>
                          <td className="border px-4 py-2">{course.TENMONHOC}</td>
                          <td className="border px-4 py-2 text-center font-semibold">{course.SOTC}</td>
                          <td className="border px-4 py-2 text-center">
                            <span className={`px-2 py-1 rounded text-sm font-semibold ${
                              course.diemChu === 'A+' || course.diemChu === 'A' ? 'bg-green-100 text-green-800' :
                              course.diemChu === 'B+' || course.diemChu === 'B' ? 'bg-blue-100 text-blue-800' :
                              course.diemChu === 'C+' || course.diemChu === 'C' ? 'bg-yellow-100 text-yellow-800' :
                              course.diemChu === 'D+' || course.diemChu === 'D' ? 'bg-orange-100 text-orange-800' :
                              course.diemChu === 'F' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {course.diemChu}
                            </span>
                          </td>
                          <td className="border px-4 py-2 text-center font-semibold">
                            {course.diemSo !== null ? course.diemSo : "--"}
                          </td>
                          <td className="border px-4 py-2 text-center font-semibold">
                            {course.diemHe4 !== "--" ? course.diemHe4 : "--"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Transcript;