import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';

const Question = () => {
  const { courseCode, examId } = useParams();
  const location = useLocation();
  const quizData = location.state?.quizData;
  const { header, question } = quizData;

  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(header.time);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  useEffect(() => {
    if (quizData) {
      setLoading(false);
    }
  }, [quizData]);

  useEffect(() => {
    if (!isSubmitted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSingleSelect = (qNum, ansKey) => {
    setUserAnswers((prev) => ({ ...prev, [qNum]: parseInt(ansKey) }));
  };

  const handleMultiSelect = (qNum, ansKey) => {
    setUserAnswers((prev) => {
      const current = prev[qNum] || [];
      const updated = current.includes(parseInt(ansKey))
        ? current.filter((k) => k !== parseInt(ansKey))
        : [...current, parseInt(ansKey)];
      return { ...prev, [qNum]: updated.sort() };
    });
  };

  const handleTextInput = (qNum, value) => {
    setUserAnswers((prev) => ({ ...prev, [qNum]: value }));
  };

  const handleSubmit = () => {
    let totalScore = 0;
    quizData.question.forEach((q) => {
      const userAns = userAnswers[q.num];
      const trueAns = q.ans_true;

      if (q.num_ans === 0) {
        if (typeof userAns === 'string' && typeof trueAns === 'string') {
          if (userAns.trim().toLowerCase() === trueAns.trim().toLowerCase()) {
            totalScore++;
          }
        }
      } else if (Array.isArray(trueAns)) {
        if (Array.isArray(userAns) && userAns.length === trueAns.length && 
            userAns.every((val, idx) => val === trueAns[idx])) {
          totalScore++;
        }
      } else if (typeof trueAns === 'number') {
        if (userAns === trueAns) {
          totalScore++;
        }
      }
    });
    setScore(totalScore);
    setShowAnswers(true);
    setIsSubmitted(true);
    setShowConfirmSubmit(false);
  };

  const getAnswerClass = (q, ansKey) => {
    if (!showAnswers) return '';
    const trueAns = q.ans_true;
    if (Array.isArray(trueAns)) {
      return trueAns.includes(parseInt(ansKey)) ? 'correct' : 'incorrect';
    }
    return parseInt(ansKey) === trueAns ? 'correct' : 'incorrect';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Exam not found</h2>
          <Link to="/exams" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            Return to Exam List
          </Link>
        </div>
      </div>
    );
  }

  const currentQ = question[currentQuestion];
  const answeredQuestions = Object.keys(userAnswers).length;
  const progress = (answeredQuestions / question.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 transform transition-all duration-300 hover:shadow-2xl">
          <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">{header.title}</h1>
                <p className="mt-2 text-blue-100">{header.course_code} - {header.course_name}</p>
                <p className="mt-1 text-blue-200">Giảng viên: {header.lecture}</p>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-mono font-bold ${
                  timeLeft < 300 ? 'text-red-300 animate-pulse' : 'text-blue-100'
                }`}>
                  {formatTime(timeLeft)}
                </div>
                <p className="text-sm mt-1 text-blue-200">Thời gian còn lại</p>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Tiến độ</span>
              <span className="text-sm font-medium text-blue-600">
                {answeredQuestions}/{question.length} đã trả lời
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Navigation */}
          <div className="p-4 bg-white border-b border-gray-200">
            <div className="flex flex-wrap gap-2">
              {question.map((q, index) => (
                <button
                  key={q.num}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-10 h-10 rounded-lg font-medium text-sm transition-all duration-200 ${
                    currentQuestion === index
                      ? 'bg-blue-600 text-white'
                      : userAnswers[q.num]
                      ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {q.num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 transform transition-all duration-300">
          <div className="mb-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Câu hỏi {currentQ.num} / {question.length}
            </span>
            <h2 className="mt-4 text-xl font-medium text-gray-900">{currentQ.content}</h2>
          </div>

          {currentQ.imageUrl && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <img 
                src={currentQ.imageUrl} 
                alt={`Question ${currentQ.num}`} 
                className="max-w-full rounded-lg shadow-md"
              />
            </div>
          )}

          <div className="space-y-4">
            {currentQ.num_ans > 0 ? (
              <div className="grid gap-4">
                {Object.entries(currentQ.ans).map(([ansKey, ansText]) => (
                  <label
                    key={ansKey}
                    className={`relative flex items-center p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
                      ${showAnswers
                        ? getAnswerClass(currentQ, ansKey) === 'correct'
                          ? 'border-green-500 bg-green-50'
                          : getAnswerClass(currentQ, ansKey) === 'incorrect'
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200'
                        : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                      }`}
                  >
                    <input
                      type={Array.isArray(currentQ.ans_true) ? 'checkbox' : 'radio'}
                      name={`q${currentQ.num}`}
                      checked={
                        Array.isArray(userAnswers[currentQ.num])
                          ? userAnswers[currentQ.num]?.includes(parseInt(ansKey))
                          : userAnswers[currentQ.num] === parseInt(ansKey)
                      }
                      onChange={() =>
                        Array.isArray(currentQ.ans_true)
                          ? handleMultiSelect(currentQ.num, ansKey)
                          : handleSingleSelect(currentQ.num, ansKey)
                      }
                      disabled={showAnswers}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 flex-1">{ansText}</span>
                    {showAnswers && (
                      <span className={`absolute right-4 flex items-center ${
                        getAnswerClass(currentQ, ansKey) === 'correct'
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}>
                        {getAnswerClass(currentQ, ansKey) === 'correct' ? (
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            ) : (
              <input
                type="text"
                value={userAnswers[currentQ.num] || ''}
                onChange={(e) => handleTextInput(currentQ.num, e.target.value)}
                disabled={showAnswers}
                placeholder="Type your answer here..."
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
              />
            )}
          </div>

          {showAnswers && currentQ.num_ans === 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl">
              <p className="text-blue-800">
                <span className="font-medium">Correct Answer:</span> {currentQ.ans_true}
              </p>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Câu hỏi trước
          </button>
          <button
            onClick={() => setCurrentQuestion(prev => Math.min(question.length - 1, prev + 1))}
            disabled={currentQuestion === question.length - 1}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Câu hỏi tiếp theo
          </button>
        </div>

        {/* Submit Section */}
        <div className="text-center">
          {!showAnswers ? (
            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Kiểm tra đáp án
            </button>
          ) : (
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">
                Your Score: {score} / {question.length}
                <span className="ml-2 text-gray-500">
                  ({Math.round((score / question.length) * 100)}%)
                </span>
              </h2>
              <Link
                to="/exams"
                className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Return to Exam List
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Submit Exam?</h3>
            <p className="text-sm text-gray-500 mb-6">
              You have answered {answeredQuestions} out of {question.length} questions. 
              Are you sure you want to submit?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Question;