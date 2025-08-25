import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const modules = import.meta.glob('../data/**/*.json', { eager: true, import: 'default' });

// Group exams by course
const groupedExams = Object.entries(modules).reduce((acc, [path, data]) => {
  const courseCode = data.header?.course_code || 'Unknown';
  if (!acc[courseCode]) {
    acc[courseCode] = [];
  }
  // Extract filename from path
  const filename = path.split('/').pop().replace('.json', '');
  acc[courseCode].push({
    path,
    filename,
    data,
  });
  return acc;
}, {});

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const ExamList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterField, setFilterField] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [expanded, setExpanded] = useState({});

  const navigate = useNavigate();

  const filteredExams = Object.entries(groupedExams).reduce((acc, [courseCode, exams]) => {
    const filteredCourseExams = exams.filter(({ data }) => {
      const term = searchTerm.toLowerCase();
      if (!data.header) return false;
      if (filterField === 'all') {
        return (
          data.header.title?.toLowerCase().includes(term) ||
          data.header.course_code?.toLowerCase().includes(term) ||
          data.header.course_name?.toLowerCase().includes(term) ||
          data.header.lecture?.toLowerCase().includes(term) ||
          data.header.time?.toLowerCase().includes(term)
        );
      } else {
        return data.header[filterField]?.toLowerCase().includes(term);
      }
    });
    if (filteredCourseExams.length > 0) {
      acc[courseCode] = filteredCourseExams;
    }
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-800">
            <h1 className="text-3xl font-bold text-white">Exam Collection</h1>
            <p className="mt-2 text-blue-100">Browse and practice with our comprehensive exam collection</p>
          </div>

          {/* Search and Filter */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search exams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterField}
                onChange={(e) => setFilterField(e.target.value)}
                className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả</option>
                <option value="course_code">Mã môn học</option>
                <option value="title">Tiêu đề</option>
                <option value="lecture">Giảng viên</option>
                <option value="course_name">Tên môn học</option>
                <option value="time">Thời gian</option>
              </select>
            </div>
          </div>

          {/* Exam List */}
          <div className="p-6">
            {Object.entries(filteredExams).length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No exams found matching your search criteria.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {Object.entries(filteredExams).map(([courseCode, exams]) => (
                  <div key={courseCode} className="bg-gray-50 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpanded({ ...expanded, [courseCode]: !expanded[courseCode] })}
                      className="w-full px-6 py-4 flex items-center justify-between bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">{courseCode}</h2>
                        <p className="text-sm text-gray-600">
                          {exams[0].data.header.course_name} - {exams.length} exams
                        </p>
                      </div>
                      <svg
                        className={`w-6 h-6 transform transition-transform ${
                          expanded[courseCode] ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {expanded[courseCode] && (
                      <div className="p-6 grid gap-4">
                        {exams.map(({ path, filename, data }) => (
                          <Link
                            key={path}
                            to={`/exams/${courseCode}/${filename}`}
                            state={{ quizData: data }}
                            className="block group"
                          >
                            <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                                    {data.header.title}
                                  </h3>
                                  <p className="mt-1 text-sm text-gray-600">
                                    Giảng viên: {data.header.lecture}
                                  </p>
                                </div>
                                <span className="px-3 py-1 text-sm text-blue-800 bg-blue-100 rounded-full">
                                  {formatTime(data.header.time)}
                                </span>
                              </div>
                              <div className="mt-4 flex items-center text-sm text-gray-500">
                                <svg
                                  className="w-4 h-4 mr-2"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                  />
                                </svg>
                                {data.question?.length || 0} questions
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamList;