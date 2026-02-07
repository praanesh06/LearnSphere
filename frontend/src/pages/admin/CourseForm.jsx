import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../utils/api';

export default function CourseForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('content');
    const [course, setCourse] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tags: '',
        website: '',
        imageUrl: '',
        published: false,
        visibility: 'EVERYONE',
        accessRule: 'OPEN',
        price: '',
        responsiblePersonId: ''
    });
    const [lessons, setLessons] = useState([]);
    const [quiz, setQuiz] = useState(null);
    const [showLessonModal, setShowLessonModal] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCourse();
    }, [id]);

    const fetchCourse = async () => {
        try {
            const [courseRes, lessonsRes, quizRes] = await Promise.all([
                apiClient.get(`/courses/${id}`),
                apiClient.get(`/courses/${id}/lessons`),
                apiClient.get(`/quizzes/course/${id}`).catch(() => ({ data: { quiz: null } }))
            ]);

            const courseData = courseRes.data.course;
            setCourse(courseData);
            setFormData({
                title: courseData.title || '',
                description: courseData.description || '',
                tags: courseData.tags ? JSON.parse(courseData.tags).join(', ') : '',
                website: courseData.website || '',
                imageUrl: courseData.imageUrl || '',
                published: courseData.published || false,
                visibility: courseData.visibility || 'EVERYONE',
                accessRule: courseData.accessRule || 'OPEN',
                price: courseData.price || '',
                responsiblePersonId: courseData.responsiblePersonId || ''
            });
            setLessons(lessonsRes.data.lessons);
            setQuiz(quizRes.data.quiz);
        } catch (err) {
            console.error('Failed to load course:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCourse = async () => {
        setSaving(true);
        try {
            const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
            await apiClient.put(`/courses/${id}`, {
                ...formData,
                tags: JSON.stringify(tagsArray),
                price: formData.price ? parseFloat(formData.price) : null
            });
            alert('Course saved successfully!');
            fetchCourse();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to save course');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteLesson = async (lessonId) => {
        if (!confirm('Are you sure you want to delete this lesson?')) return;

        try {
            await apiClient.delete(`/courses/${id}/lessons/${lessonId}`);
            fetchCourse();
        } catch (err) {
            alert('Failed to delete lesson');
        }
    };

    const handleSaveLesson = async (lessonData) => {
        try {
            if (editingLesson) {
                await apiClient.put(`/courses/${id}/lessons/${editingLesson.id}`, lessonData);
            } else {
                await apiClient.post(`/courses/${id}/lessons`, lessonData);
            }
            setShowLessonModal(false);
            setEditingLesson(null);
            fetchCourse();
        } catch (err) {
            alert('Failed to save lesson');
        }
    };

    const handleCreateQuiz = async () => {
        try {
            await apiClient.post(`/quizzes/course/${id}`, {
                title: `${formData.title} Quiz`,
                description: 'Test your knowledge',
                passingScore: 70
            });
            fetchCourse();
        } catch (err) {
            alert('Failed to create quiz');
        }
    };

    const handleAddQuestion = async (questionData) => {
        try {
            await apiClient.post(`/quizzes/${quiz.id}/questions`, questionData);
            setShowQuestionModal(false);
            fetchCourse();
        } catch (err) {
            alert('Failed to add question');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <button
                        onClick={() => navigate('/admin/courses')}
                        className="text-primary hover:underline mb-2"
                    >
                        ← Back to Courses
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">{formData.title}</h1>
                </div>
                <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.published}
                            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                            className="w-5 h-5"
                        />
                        <span className="font-medium">Published</span>
                    </label>
                    <button onClick={handleSaveCourse} disabled={saving} className="btn-primary">
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8">
                    {['content', 'description', 'options', 'quiz'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content Tab */}
            {activeTab === 'content' && (
                <div className="card">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Course Content</h2>
                        <button
                            onClick={() => {
                                setEditingLesson(null);
                                setShowLessonModal(true);
                            }}
                            className="btn-primary"
                        >
                            + Add Lesson
                        </button>
                    </div>

                    <div className="space-y-3">
                        {lessons.map((lesson, idx) => (
                            <div key={lesson.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-400 font-medium">{idx + 1}</span>
                                    <div>
                                        <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                                        <p className="text-sm text-gray-500">
                                            {lesson.type} {lesson.duration && `• ${lesson.duration} min`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingLesson(lesson);
                                            setShowLessonModal(true);
                                        }}
                                        className="btn-secondary text-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteLesson(lesson.id)}
                                        className="btn-danger text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {lessons.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No lessons yet. Click "Add Lesson" to get started.
                        </div>
                    )}
                </div>
            )}

            {/* Description Tab */}
            {activeTab === 'description' && (
                <div className="card space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="input-field"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="input-field"
                            rows="6"
                            placeholder="Describe your course..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tags (comma-separated)
                        </label>
                        <input
                            type="text"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            className="input-field"
                            placeholder="Web Development, React, JavaScript"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                        <input
                            type="url"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            className="input-field"
                            placeholder="https://example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                        <input
                            type="url"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            className="input-field"
                            placeholder="https://example.com/image.jpg"
                        />
                        {formData.imageUrl && (
                            <img
                                src={formData.imageUrl}
                                alt="Preview"
                                className="mt-2 w-64 h-40 object-cover rounded-lg"
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Options Tab */}
            {activeTab === 'options' && (
                <div className="card space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
                        <select
                            value={formData.visibility}
                            onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                            className="input-field"
                        >
                            <option value="EVERYONE">Everyone (including guests)</option>
                            <option value="SIGNED_IN">Signed-in users only</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Access Rule</label>
                        <select
                            value={formData.accessRule}
                            onChange={(e) => setFormData({ ...formData, accessRule: e.target.value })}
                            className="input-field"
                        >
                            <option value="OPEN">Open (anyone can enroll)</option>
                            <option value="INVITATION">Invitation only</option>
                            <option value="PAYMENT">Payment required</option>
                        </select>
                    </div>

                    {formData.accessRule === 'PAYMENT' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="input-field"
                                placeholder="49.99"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Quiz Tab */}
            {activeTab === 'quiz' && (
                <div className="card">
                    {!quiz ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-4">No quiz created yet</p>
                            <button onClick={handleCreateQuiz} className="btn-primary">
                                Create Quiz
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold">{quiz.title}</h2>
                                <button onClick={() => setShowQuestionModal(true)} className="btn-primary">
                                    + Add Question
                                </button>
                            </div>

                            <div className="space-y-4">
                                {quiz.questions?.map((question, idx) => (
                                    <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-medium text-gray-900">
                                                {idx + 1}. {question.text}
                                            </h3>
                                            <span className="text-sm text-gray-500">{question.points} pts</span>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            {JSON.parse(question.options).map((option, optIdx) => {
                                                const isCorrect = JSON.parse(question.correctAnswers).includes(optIdx);
                                                return (
                                                    <div
                                                        key={optIdx}
                                                        className={`p-2 rounded ${isCorrect ? 'bg-green-50 text-green-700' : 'text-gray-600'}`}
                                                    >
                                                        {option} {isCorrect && '✓'}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Lesson Modal */}
            {showLessonModal && (
                <LessonModal
                    lesson={editingLesson}
                    onSave={handleSaveLesson}
                    onClose={() => {
                        setShowLessonModal(false);
                        setEditingLesson(null);
                    }}
                />
            )}

            {/* Question Modal */}
            {showQuestionModal && (
                <QuestionModal
                    onSave={handleAddQuestion}
                    onClose={() => setShowQuestionModal(false)}
                />
            )}
        </div>
    );
}

// Lesson Modal Component
function LessonModal({ lesson, onSave, onClose }) {
    const [formData, setFormData] = useState({
        title: lesson?.title || '',
        description: lesson?.description || '',
        type: lesson?.type || 'VIDEO',
        contentUrl: lesson?.contentUrl || '',
        duration: lesson?.duration || '',
        allowDownload: lesson?.allowDownload || false
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            duration: formData.duration ? parseInt(formData.duration) : null
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">{lesson ? 'Edit Lesson' : 'Add Lesson'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="input-field"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="input-field"
                        >
                            <option value="VIDEO">Video</option>
                            <option value="DOCUMENT">Document</option>
                            <option value="IMAGE">Image</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Content URL</label>
                        <input
                            type="url"
                            value={formData.contentUrl}
                            onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
                            className="input-field"
                            placeholder="https://youtube.com/watch?v=..."
                        />
                    </div>

                    {formData.type === 'VIDEO' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Duration (minutes)
                            </label>
                            <input
                                type="number"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                className="input-field"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="input-field"
                            rows="3"
                        />
                    </div>

                    {formData.type !== 'VIDEO' && (
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.allowDownload}
                                onChange={(e) => setFormData({ ...formData, allowDownload: e.target.checked })}
                            />
                            <span className="text-sm">Allow download</span>
                        </label>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary flex-1">
                            Save Lesson
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Question Modal Component
function QuestionModal({ onSave, onClose }) {
    const [formData, setFormData] = useState({
        text: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        points: 10
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            text: formData.text,
            options: formData.options.filter(o => o.trim()),
            correctAnswers: [formData.correctAnswer],
            points: parseInt(formData.points)
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">Add Question</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Question *</label>
                        <textarea
                            value={formData.text}
                            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                            className="input-field"
                            rows="2"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                        {formData.options.map((option, idx) => (
                            <div key={idx} className="flex items-center gap-2 mb-2">
                                <input
                                    type="radio"
                                    checked={formData.correctAnswer === idx}
                                    onChange={() => setFormData({ ...formData, correctAnswer: idx })}
                                    className="w-4 h-4"
                                />
                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => {
                                        const newOptions = [...formData.options];
                                        newOptions[idx] = e.target.value;
                                        setFormData({ ...formData, options: newOptions });
                                    }}
                                    className="input-field"
                                    placeholder={`Option ${idx + 1}`}
                                    required
                                />
                            </div>
                        ))}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Points</label>
                        <input
                            type="number"
                            value={formData.points}
                            onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                            className="input-field"
                            min="1"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary flex-1">
                            Add Question
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
