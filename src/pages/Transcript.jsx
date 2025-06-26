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
  // State cho dữ liệu (có thể chỉnh sửa)
  const [currentData, setCurrentData] = useState(transcriptData.data);
  const { diemSinhVien, khoiKienThuc } = currentData;
  
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

  // State cho quản lý môn học và điểm
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [activeTab, setActiveTab] = useState('courses'); // 'courses' hoặc 'scores'
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingScore, setEditingScore] = useState(null);
  const [courseForm, setCourseForm] = useState({
    MAMONHOC: '',
    TENMONHOC: '',
    SOTC: '',
    TENKHOIKIENTHUC: '',
    KHOIKIENTHUCID: ''
  });
  const [scoreForm, setScoreForm] = useState({
    MONHOCID: '',
    DIEMCHU: '',
    DIEMSO: ''
  });

  // State cho xác thực mật khẩu
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [pendingAction, setPendingAction] = useState(null);
  const PASSWORD = 'phucnhanvythuong@28982';

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

  // Hàm xác thực mật khẩu
  const requestPasswordAuth = (action, actionName) => {
    setPendingAction({ action, actionName });
    setPasswordInput('');
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === PASSWORD) {
      setShowPasswordModal(false);
      setPasswordInput('');
      if (pendingAction) {
        pendingAction.action();
        setPendingAction(null);
      }
    } else {
      alert('Mật khẩu không đúng!');
      setPasswordInput('');
    }
  };

  const handlePasswordCancel = () => {
    setShowPasswordModal(false);
    setPasswordInput('');
    setPendingAction(null);
  };

  // Hàm wrapper cho các thao tác cần xác thực
  const authenticatedAddCourse = () => {
    requestPasswordAuth(handleAddCourse, 'thêm môn học');
  };

  const authenticatedUpdateCourse = () => {
    requestPasswordAuth(handleUpdateCourse, 'cập nhật môn học');
  };

  const authenticatedDeleteCourse = (courseId) => {
    requestPasswordAuth(() => handleDeleteCourse(courseId), 'xóa môn học');
  };

  const authenticatedAddScore = () => {
    requestPasswordAuth(handleAddScore, 'thêm điểm');
  };

  const authenticatedUpdateScore = () => {
    requestPasswordAuth(handleUpdateScore, 'cập nhật điểm');
  };

  const authenticatedDeleteScore = (monhocId) => {
    requestPasswordAuth(() => handleDeleteScore(monhocId), 'xóa điểm');
  };

  const authenticatedSaveToFile = () => {
    requestPasswordAuth(handleSaveToOriginalFileDirect, 'lưu vào file gốc và commit');
  };

  // Hàm xử lý CRUD cho môn học
  const handleAddCourse = () => {
    if (!courseForm.MAMONHOC || !courseForm.TENMONHOC || !courseForm.SOTC || !courseForm.TENKHOIKIENTHUC) {
      alert('Vui lòng điền đầy đủ thông tin môn học');
      return;
    }

    const newCourse = {
      ...courseForm,
      MONHOCID: Date.now(), // Generate unique ID
      SOTC: parseInt(courseForm.SOTC),
      KHOIKIENTHUCID: courseForm.KHOIKIENTHUCID || Date.now()
    };

    setCurrentData(prev => ({
      ...prev,
      khoiKienThuc: [...prev.khoiKienThuc, newCourse]
    }));

    setCourseForm({
      MAMONHOC: '',
      TENMONHOC: '',
      SOTC: '',
      TENKHOIKIENTHUC: '',
      KHOIKIENTHUCID: ''
    });

    alert('Thêm môn học thành công!');
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      MAMONHOC: course.MAMONHOC,
      TENMONHOC: course.TENMONHOC,
      SOTC: course.SOTC.toString(),
      TENKHOIKIENTHUC: course.TENKHOIKIENTHUC,
      KHOIKIENTHUCID: course.KHOIKIENTHUCID.toString()
    });
  };

  const handleUpdateCourse = () => {
    if (!courseForm.MAMONHOC || !courseForm.TENMONHOC || !courseForm.SOTC || !courseForm.TENKHOIKIENTHUC) {
      alert('Vui lòng điền đầy đủ thông tin môn học');
      return;
    }

    setCurrentData(prev => ({
      ...prev,
      khoiKienThuc: prev.khoiKienThuc.map(course => 
        course.MONHOCID === editingCourse.MONHOCID 
          ? { ...course, ...courseForm, SOTC: parseInt(courseForm.SOTC) }
          : course
      )
    }));

    setEditingCourse(null);
    setCourseForm({
      MAMONHOC: '',
      TENMONHOC: '',
      SOTC: '',
      TENKHOIKIENTHUC: '',
      KHOIKIENTHUCID: ''
    });

    alert('Cập nhật môn học thành công!');
  };

  const handleDeleteCourse = (courseId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa môn học này?')) {
      setCurrentData(prev => ({
        ...prev,
        khoiKienThuc: prev.khoiKienThuc.filter(course => course.MONHOCID !== courseId),
        diemSinhVien: prev.diemSinhVien.filter(score => score.MONHOCID !== courseId)
      }));
      alert('Xóa môn học thành công!');
    }
  };

  // Hàm xử lý CRUD cho điểm số
  const handleAddScore = () => {
    if (!scoreForm.MONHOCID || !scoreForm.DIEMCHU || !scoreForm.DIEMSO) {
      alert('Vui lòng điền đầy đủ thông tin điểm');
      return;
    }

    const existingScore = diemSinhVien.find(score => score.MONHOCID === parseInt(scoreForm.MONHOCID));
    if (existingScore) {
      alert('Môn học này đã có điểm. Vui lòng sử dụng chức năng sửa điểm.');
      return;
    }

    const newScore = {
      MONHOCID: parseInt(scoreForm.MONHOCID),
      DIEMCHU: scoreForm.DIEMCHU,
      DIEMSO: parseFloat(scoreForm.DIEMSO)
    };

    setCurrentData(prev => ({
      ...prev,
      diemSinhVien: [...prev.diemSinhVien, newScore]
    }));

    setScoreForm({
      MONHOCID: '',
      DIEMCHU: '',
      DIEMSO: ''
    });

    alert('Thêm điểm thành công!');
  };

  const handleEditScore = (score) => {
    console.log('Editing score:', score); // Debug log
    setEditingScore(score);
    setScoreForm({
      MONHOCID: score.MONHOCID.toString(),
      DIEMCHU: score.DIEMCHU,
      DIEMSO: score.DIEMSO.toString()
    });
  };

  const handleUpdateScore = () => {
    console.log('Updating score:', { editingScore, scoreForm }); // Debug log
    
    if (!scoreForm.MONHOCID || !scoreForm.DIEMCHU || !scoreForm.DIEMSO) {
      alert('Vui lòng điền đầy đủ thông tin điểm');
      return;
    }

    setCurrentData(prev => ({
      ...prev,
      diemSinhVien: prev.diemSinhVien.map(score => 
        score.MONHOCID === editingScore.MONHOCID 
          ? { ...score, DIEMCHU: scoreForm.DIEMCHU, DIEMSO: parseFloat(scoreForm.DIEMSO) }
          : score
      )
    }));

    setEditingScore(null);
    setScoreForm({
      MONHOCID: '',
      DIEMCHU: '',
      DIEMSO: ''
    });

    alert('Cập nhật điểm thành công!');
  };

  const handleDeleteScore = (monhocId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa điểm này?')) {
      setCurrentData(prev => ({
        ...prev,
        diemSinhVien: prev.diemSinhVien.filter(score => score.MONHOCID !== monhocId)
      }));
      alert('Xóa điểm thành công!');
    }
  };

  // Hàm dọn dẹp điểm "mồ côi" (không có môn học tương ứng)
  const handleCleanOrphanedScores = () => {
    const orphanedScores = diemSinhVien.filter(score => !khoiKienThuc.find(c => c.MONHOCID === score.MONHOCID));
    if (orphanedScores.length === 0) {
      alert('Không có điểm mồ côi nào cần dọn dẹp!');
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa ${orphanedScores.length} điểm không có môn học tương ứng?`)) {
      setCurrentData(prev => ({
        ...prev,
        diemSinhVien: prev.diemSinhVien.filter(score => khoiKienThuc.find(c => c.MONHOCID === score.MONHOCID))
      }));
      alert(`Đã dọn dẹp ${orphanedScores.length} điểm mồ côi!`);
    }
  };

  // Hàm xuất dữ liệu JSON
  const handleExportData = () => {
    const dataStr = JSON.stringify({ code: "200", msg: "ok", data: currentData }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'diem_updated.json';
    link.click();
  };

  // Hàm lưu vào file gốc và commit
  const handleSaveToOriginalFile = async () => {
    try {
      const dataStr = JSON.stringify({ code: "200", msg: "ok", data: currentData }, null, 2);
      
      // Ghi đè file gốc
      const response = await fetch('/api/save-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: dataStr,
          filePath: 'src/data/diem.json'
        })
      });

      if (response.ok) {
        // Tự động commit và push
        const gitResponse = await fetch('/api/git-commit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: 'Update transcript data - ' + new Date().toLocaleString('vi-VN'),
            files: ['src/data/diem.json']
          })
        });

        if (gitResponse.ok) {
          alert('✅ Đã lưu thành công và commit lên git!');
        } else {
          alert('⚠️ Đã lưu file nhưng commit thất bại. Vui lòng commit thủ công.');
        }
      } else {
        throw new Error('Failed to save file');
      }
    } catch (error) {
      console.error('Error saving file:', error);
      alert('❌ Lỗi khi lưu file: ' + error.message);
    }
  };

  // Hàm lưu vào file gốc bằng cách ghi trực tiếp (fallback)
  const handleSaveToOriginalFileDirect = () => {
    if (!window.confirm('⚠️ CẢNH BÁO: Bạn có chắc chắn muốn ghi đè file diem.json gốc?\n\nThao tác này sẽ:\n- Thay thế hoàn toàn dữ liệu hiện tại\n- Tạo commit và push lên git\n- KHÔNG THỂ HOÀN TÁC\n\nHãy đảm bảo bạn đã backup dữ liệu!')) {
      return;
    }

    const dataStr = JSON.stringify({ code: "200", msg: "ok", data: currentData }, null, 2);
    
    // Download backup trước
    const backupBlob = new Blob([dataStr], { type: 'application/json' });
    const backupUrl = URL.createObjectURL(backupBlob);
    const backupLink = document.createElement('a');
    backupLink.href = backupUrl;
    backupLink.download = `diem_backup_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    backupLink.click();

    // Thông báo cho người dùng về việc cần manual save
    alert('📄 Đã tạo file backup.\n\n🔧 Để lưu vào file gốc, vui lòng:\n1. Copy nội dung từ file backup\n2. Paste vào src/data/diem.json\n3. Commit và push thủ công\n\nHoặc sử dụng tính năng "Xuất JSON" để lưu thành file riêng.');
  };

  return (
    <div className="flex min-h-screen bg-gray-50 mt-[100px]">
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
                <span className="text-indigo-600 font-medium">� Tổng quan:</span>
                <span>Điểm TB các khối → So sánh nhanh chất lượng học tập giữa các khối</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-medium">📊 Chi tiết:</span>
                <span>Điểm TB theo khối (ngang) → Xem chi tiết từng khối (chỉ tính môn xét điểm)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-medium">📈 Tiến độ:</span>
                <span>Tín chỉ theo khối → Bạn đã hoàn thành bao nhiêu % ở mỗi khối</span>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <span className="text-purple-600 font-medium">🎯 Mẹo:</span>
                <span> Khối có điểm TB cao nhưng tiến độ thấp = cần học thêm môn</span>
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

          {/* Biểu đồ cột - Điểm trung bình các khối kiến thức (Tổng quan) */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              📈 Điểm trung bình các khối
              <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">Tổng quan</span>
            </h3>
            <div className="text-sm text-gray-600 mb-3 bg-indigo-50 p-3 rounded-lg">
              <div className="font-medium text-indigo-800">Tổng quan chất lượng học tập:</div>
              <div>• So sánh nhanh điểm TB giữa các khối kiến thức</div>
              <div>• Chỉ hiển thị khối có ít nhất 1 môn xét điểm</div>
              <div>• Giúp xác định khối mạnh/yếu của bản thân</div>
            </div>
            {kktData.filter(item => item.hasScore).length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={kktData.filter(item => item.hasScore).slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 9 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis domain={[0, 10]} />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                            <p className="font-semibold text-gray-800 mb-2">{data.fullName}</p>
                            <div className="space-y-1">
                              <p className="text-indigo-600 font-medium">
                                📊 Điểm TB: {data.avgScore}/10
                              </p>
                              <p className="text-green-600">🎯 Môn xét điểm: {data.gradedCount}</p>
                              <p className="text-gray-600">📚 Tổng môn: {data.count}</p>
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <p className="text-xs text-gray-500">
                                  💡 Thứ hạng: #{kktData.filter(item => item.hasScore).findIndex(item => item.fullName === data.fullName) + 1} / {kktData.filter(item => item.hasScore).length}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="avgScore" 
                    fill="#6366F1"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📈</div>
                <p>Chưa có dữ liệu điểm để hiển thị</p>
                <p className="text-xs mt-1">Cần có ít nhất một khối có môn xét điểm</p>
              </div>
            )}
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
                <span>Điểm TB tổng các khối:</span>
                <span className="font-semibold text-purple-600">
                  {(() => {
                    const validKKT = kktData.filter(item => item.hasScore && item.avgScore > 0);
                    if (validKKT.length === 0) return 'N/A';
                    const totalAvg = validKKT.reduce((sum, item) => sum + item.avgScore, 0) / validKKT.length;
                    return `${totalAvg.toFixed(2)}/10`;
                  })()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Số khối có điểm:</span>
                <span className="font-semibold text-indigo-600">
                  {kktData.filter(item => item.hasScore).length} / {kktData.length}
                </span>
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

            {/* Xếp hạng khối kiến thức hoàn thành tốt nhất */}
            <div className="space-y-2 text-sm border-t pt-4">
              <h4 className="font-medium text-gray-700">🏆 Xếp hạng khối kiến thức hoàn thành</h4>
              <div className="text-xs text-gray-500 mb-2">
                Xếp hạng theo tỷ lệ % tín chỉ đã hoàn thành
              </div>
              {creditProgressData.slice(0, 15).map((kkt, index) => (
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
              <h4 className="font-medium text-gray-700">📊 Xếp hạng điểm trung bình</h4>
              <div className="text-xs text-gray-500 mb-2">
                Khối kiến thức có điểm TB cao nhất
              </div>
              {kktData.filter(item => item.avgScore > 0).slice(0, 15).map((kkt, index) => (
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
                onClick={() => setShowManagementModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                ⚙️ Quản lý dữ liệu
              </button>
              <button
                onClick={handleExportData}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                💾 Xuất JSON
              </button>
              <button
                onClick={() => requestPasswordAuth(handleSaveToOriginalFileDirect, 'lưu vào file gốc và commit')}
                className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                title="Ghi đè file diem.json gốc và tự động commit"
              >
                🔄 Lưu & Commit
              </button>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                📊 {sidebarOpen ? 'Ẩn phân tích' : 'Xem phân tích'}
              </button>
            </div>
          </div>
          
          {/* Thống kê tổng quan */}
          <div className="mb-6 p-3 bg-blue-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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

      {/* Modal quản lý dữ liệu */}
      {showManagementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">⚙️ Quản lý dữ liệu</h2>
                <button
                  onClick={() => {
                    setShowManagementModal(false);
                    setEditingCourse(null);
                    setEditingScore(null);
                    setCourseForm({
                      MAMONHOC: '',
                      TENMONHOC: '',
                      SOTC: '',
                      TENKHOIKIENTHUC: '',
                      KHOIKIENTHUCID: ''
                    });
                    setScoreForm({
                      MONHOCID: '',
                      DIEMCHU: '',
                      DIEMSO: ''
                    });
                    console.log('Modal closed, states reset'); // Debug log
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>
              
              {/* Tabs */}
              <div className="flex mt-4 border-b">
                <button
                  onClick={() => setActiveTab('courses')}
                  className={`px-4 py-2 font-medium ${
                    activeTab === 'courses' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  📚 Quản lý môn học
                </button>
                <button
                  onClick={() => setActiveTab('scores')}
                  className={`px-4 py-2 font-medium ${
                    activeTab === 'scores' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  📊 Quản lý điểm số
                </button>
              </div>
            </div>

            <div className="p-4">
              {/* Tab Quản lý môn học */}
              {activeTab === 'courses' && (
                <div>
                  {/* Form thêm/sửa môn học */}
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">
                      {editingCourse ? '✏️ Sửa môn học' : '➕ Thêm môn học mới'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mã môn học</label>
                        <input
                          type="text"
                          value={courseForm.MAMONHOC}
                          onChange={(e) => setCourseForm({...courseForm, MAMONHOC: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          placeholder="VD: CO1007"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên môn học</label>
                        <input
                          type="text"
                          value={courseForm.TENMONHOC}
                          onChange={(e) => setCourseForm({...courseForm, TENMONHOC: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          placeholder="VD: Cấu trúc Rời rạc cho Khoa học Máy tính"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số tín chỉ</label>
                        <input
                          type="number"
                          value={courseForm.SOTC}
                          onChange={(e) => setCourseForm({...courseForm, SOTC: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          placeholder="VD: 3"
                          min="1"
                          max="10"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Khối kiến thức</label>
                        <select
                          value={courseForm.TENKHOIKIENTHUC}
                          onChange={(e) => setCourseForm({...courseForm, TENKHOIKIENTHUC: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Chọn khối kiến thức</option>
                          {[...new Set(khoiKienThuc.map(c => c.TENKHOIKIENTHUC))].map(kkt => (
                            <option key={kkt} value={kkt}>{kkt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      {editingCourse ? (
                        <>
                          <button
                            onClick={authenticatedUpdateCourse}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            💾 Cập nhật
                          </button>
                          <button
                            onClick={() => {
                              setEditingCourse(null);
                              setCourseForm({
                                MAMONHOC: '',
                                TENMONHOC: '',
                                SOTC: '',
                                TENKHOIKIENTHUC: '',
                                KHOIKIENTHUCID: ''
                              });
                            }}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                          >
                            ❌ Hủy
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={authenticatedAddCourse}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          ➕ Thêm môn học
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Danh sách môn học */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">📋 Danh sách môn học</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full table-auto border border-gray-300">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="border px-4 py-2 text-left">Mã môn</th>
                            <th className="border px-4 py-2 text-left">Tên môn</th>
                            <th className="border px-4 py-2">Số TC</th>
                            <th className="border px-4 py-2 text-left">Khối kiến thức</th>
                            <th className="border px-4 py-2">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {khoiKienThuc.map((course, index) => (
                            <tr key={course.MONHOCID} className="even:bg-gray-50 hover:bg-blue-50">
                              <td className="border px-4 py-2 font-mono">{course.MAMONHOC}</td>
                              <td className="border px-4 py-2">{course.TENMONHOC}</td>
                              <td className="border px-4 py-2 text-center">{course.SOTC}</td>
                              <td className="border px-4 py-2">{course.TENKHOIKIENTHUC}</td>
                              <td className="border px-4 py-2 text-center">
                                <div className="flex gap-2 justify-center">
                                  <button
                                    onClick={() => handleEditCourse(course)}
                                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                                  >
                                    ✏️ Sửa
                                  </button>
                                  <button
                                    onClick={() => authenticatedDeleteCourse(course.MONHOCID)}
                                    className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                                  >
                                    🗑️ Xóa
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Quản lý điểm số */}
              {activeTab === 'scores' && (
                <div>
                  {/* Form thêm/sửa điểm */}
                  <div className="mb-6 p-4 bg-green-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">
                      {editingScore ? '✏️ Sửa điểm' : '➕ Thêm điểm mới'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Môn học</label>
                        <select
                          value={scoreForm.MONHOCID}
                          onChange={(e) => setScoreForm({...scoreForm, MONHOCID: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                          disabled={!!editingScore}
                        >
                          <option value="">Chọn môn học</option>
                          {khoiKienThuc.map(course => (
                            <option key={course.MONHOCID} value={course.MONHOCID}>
                              {course.MAMONHOC} - {course.TENMONHOC}
                            </option>
                          ))}
                        </select>
                        {editingScore && (
                          <div className="mt-1 text-xs text-gray-500">
                            💡 Không thể thay đổi môn học khi sửa điểm
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Điểm chữ</label>
                        <select
                          value={scoreForm.DIEMCHU}
                          onChange={(e) => setScoreForm({...scoreForm, DIEMCHU: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Chọn điểm chữ</option>
                          <option value="A+">A+</option>
                          <option value="A">A</option>
                          <option value="B+">B+</option>
                          <option value="B">B</option>
                          <option value="C+">C+</option>
                          <option value="C">C</option>
                          <option value="D+">D+</option>
                          <option value="D">D</option>
                          <option value="F">F</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Điểm số</label>
                        <input
                          type="number"
                          value={scoreForm.DIEMSO}
                          onChange={(e) => setScoreForm({...scoreForm, DIEMSO: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                          placeholder="VD: 8.5"
                          min="0"
                          max="10"
                          step="0.1"
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      {editingScore ? (
                        <>
                          <button
                            onClick={authenticatedUpdateScore}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            💾 Cập nhật
                          </button>
                          <button
                            onClick={() => {
                              setEditingScore(null);
                              setScoreForm({
                                MONHOCID: '',
                                DIEMCHU: '',
                                DIEMSO: ''
                              });
                              console.log('Cancelled editing score'); // Debug log
                            }}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                          >
                            ❌ Hủy
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={authenticatedAddScore}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          ➕ Thêm điểm
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Danh sách điểm */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">📊 Danh sách điểm</h3>
                      {/* Nút dọn dẹp điểm mồ côi */}
                      {diemSinhVien.filter(score => !khoiKienThuc.find(c => c.MONHOCID === score.MONHOCID)).length > 0 && (
                        <button
                          onClick={handleCleanOrphanedScores}
                          className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                          title="Xóa các điểm không có môn học tương ứng"
                        >
                          🧹 Dọn dẹp điểm mồ côi ({diemSinhVien.filter(score => !khoiKienThuc.find(c => c.MONHOCID === score.MONHOCID)).length})
                        </button>
                      )}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full table-auto border border-gray-300">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="border px-4 py-2 text-left">Mã môn</th>
                            <th className="border px-4 py-2 text-left">Tên môn</th>
                            <th className="border px-4 py-2">Điểm chữ</th>
                            <th className="border px-4 py-2">Điểm số</th>
                            <th className="border px-4 py-2">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {diemSinhVien
                            .filter(score => {
                              // Chỉ hiển thị điểm có môn học tương ứng
                              const course = khoiKienThuc.find(c => c.MONHOCID === score.MONHOCID);
                              return course; // Loại bỏ những điểm không có môn học
                            })
                            .map((score) => {
                            const course = khoiKienThuc.find(c => c.MONHOCID === score.MONHOCID);
                            return (
                              <tr key={score.MONHOCID} className="even:bg-gray-50 hover:bg-green-50">
                                <td className="border px-4 py-2 font-mono">{course.MAMONHOC}</td>
                                <td className="border px-4 py-2">{course.TENMONHOC}</td>
                                <td className="border px-4 py-2 text-center">
                                  <span className={`px-2 py-1 rounded text-sm font-semibold ${
                                    score.DIEMCHU === 'A+' || score.DIEMCHU === 'A' ? 'bg-green-100 text-green-800' :
                                    score.DIEMCHU === 'B+' || score.DIEMCHU === 'B' ? 'bg-blue-100 text-blue-800' :
                                    score.DIEMCHU === 'C+' || score.DIEMCHU === 'C' ? 'bg-yellow-100 text-yellow-800' :
                                    score.DIEMCHU === 'D+' || score.DIEMCHU === 'D' ? 'bg-orange-100 text-orange-800' :
                                    score.DIEMCHU === 'F' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {score.DIEMCHU}
                                  </span>
                                </td>
                                <td className="border px-4 py-2 text-center font-semibold">{score.DIEMSO}</td>
                                <td className="border px-4 py-2 text-center">
                                  <div className="flex gap-2 justify-center">
                                    <button
                                      onClick={() => handleEditScore(score)}
                                      className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                                    >
                                      ✏️ Sửa
                                    </button>
                                    <button
                                      onClick={() => authenticatedDeleteScore(score.MONHOCID)}
                                      className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                                    >
                                      🗑️ Xóa
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                          {/* Thông báo nếu có điểm bị "mồ côi" */}
                          {diemSinhVien.filter(score => !khoiKienThuc.find(c => c.MONHOCID === score.MONHOCID)).length > 0 && (
                            <tr>
                              <td colSpan="5" className="border px-4 py-2 text-center bg-yellow-50">
                                <div className="text-yellow-800 text-sm">
                                  ⚠️ Có {diemSinhVien.filter(score => !khoiKienThuc.find(c => c.MONHOCID === score.MONHOCID)).length} điểm không có môn học tương ứng (đã bị ẩn)
                                  <br />
                                  <span className="text-xs">Có thể do môn học đã bị xóa. Hãy xóa những điểm này để dọn dẹp dữ liệu.</span>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal xác thực mật khẩu */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90% mx-4">
            <h2 className="text-xl font-bold mb-4 text-center">🔐 Xác thực mật khẩu</h2>
            <p className="text-gray-600 mb-4 text-center">
              Vui lòng nhập mật khẩu để {pendingAction?.actionName}
            </p>
            
            <div className="mb-4">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handlePasswordSubmit();
                  }
                }}
                autoFocus
              />
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={handlePasswordCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                ❌ Hủy
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                ✅ Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transcript;