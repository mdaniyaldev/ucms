import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { BookOpen, Laptop, Bus, Building2, Upload, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { createComplaint, listDepartmentsWithCategories } from '../../lib/student';
import { useNavigate } from 'react-router-dom';

export function SubmitComplaintForm({ language = 'en' }) {
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [department, setDepartment] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);

  const text = {
    en: {
      title: 'Submit New Complaint',
      subtitle: 'Fill out the form below to submit your complaint',
      complaintTitle: 'Complaint Title',
      titlePlaceholder: 'Brief title for your complaint',
      description: 'Description',
      descriptionPlaceholder: 'Describe your issue in detail...',
      category: 'Category',
      selectCategory: 'Select a category',
      academic: 'Academic',
      it: 'IT Services',
      transport: 'Transport',
      administrative: 'Administrative',
      department: 'Department',
      selectDepartment: 'Select a department',
      uploadEvidence: 'Upload Evidence (Optional)',
      uploadDesc: 'Upload photos, videos, or documents',
      submit: 'Submit Complaint',
      cancel: 'Cancel',
      successMessage: 'Complaint submitted successfully!',
      successDescription: 'Your complaint has been registered and assigned to the relevant department.',
      errorOccurred: 'Error occurred',
      pleaseSelectCategory: 'Please select a category',
      pleaseSelectDepartment: 'Please select a department',
      requiredField: 'This field is required',
      backToDashboard: 'Back to Dashboard',
      chooseFiles: 'Choose Files',
      noDepartmentsAvailable: 'No departments available for this category',
    },
    ur: {
      title: 'نئی شکایت جمع کرائیں',
      subtitle: 'اپنی شکایت جمع کرانے کے لیے فارم بھریں',
      complaintTitle: 'شکایت کا عنوان',
      titlePlaceholder: 'اپنی شکایت کا مختصر عنوان',
      description: 'تفصیل',
      descriptionPlaceholder: 'اپنے مسئلے کی تفصیل سے وضاحت کریں...',
      category: 'قسم',
      selectCategory: 'ایک قسم منتخب کریں',
      academic: 'تعلیمی',
      it: 'آئی ٹی سروسز',
      transport: 'نقل و حمل',
      administrative: 'انتظامی',
      department: 'محکمہ',
      selectDepartment: 'ایک محکمہ منتخب کریں',
      uploadEvidence: 'ثبوت اپ لوڈ کریں (اختیاری)',
      uploadDesc: 'تصاویر، ویڈیوز، یا دستاویزات اپ لوڈ کریں',
      submit: 'شکایت جمع کرائیں',
      cancel: 'منسوخ کریں',
      successMessage: 'شکایت کامیابی سے جمع ہو گئی!',
      successDescription: 'آپ کی شکایت رجسٹر ہو گئی ہے اور متعلقہ محکمے کو بھیج دی گئی ہے۔',
      errorOccurred: 'خرابی واقع ہوئی',
      pleaseSelectCategory: 'براہ کرم ایک قسم منتخب کریں',
      pleaseSelectDepartment: 'براہ کرم ایک محکمہ منتخب کریں',
      requiredField: 'یہ فیلڈ ضروری ہے',
      backToDashboard: 'ڈیش بورڈ پر واپس جائیں',
      chooseFiles: 'فائلیں منتخب کریں',
      noDepartmentsAvailable: 'اس قسم کے لیے کوئی محکمہ دستیاب نہیں',
    },
  };

  const categories = [
    { value: 'academic', label: text[language].academic, icon: BookOpen },
    { value: 'it', label: text[language].it, icon: Laptop },
    { value: 'transport', label: text[language].transport, icon: Bus },
    { value: 'administrative', label: text[language].administrative, icon: Building2 },
  ];

  // Fetch departments with their allowed categories on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setDepartmentsLoading(true);
        const data = await listDepartmentsWithCategories();
        setDepartments(data || []);
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError(err.message);
      } finally {
        setDepartmentsLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  // Filter departments by category - only show departments that support this category
  const categoryDepartments = departments.filter((dept) => {
    if (!category) return false;
    return dept.categories.includes(category);
  });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!title.trim()) {
      setError(text[language].requiredField);
      return;
    }
    if (!description.trim()) {
      setError(text[language].requiredField);
      return;
    }
    if (!category) {
      setError(text[language].pleaseSelectCategory);
      return;
    }
    if (!department) {
      setError(text[language].pleaseSelectDepartment);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Find department ID from selected department name
      const selectedDept = departments.find((d) => d.name === department);
      const departmentId = selectedDept?.id;

      if (!departmentId) {
        throw new Error('Department not found');
      }

      // Create complaint
      await createComplaint({
        title: title.trim(),
        body: description.trim(),
        category,
        departmentId,
      });

      setSuccess(true);
      setTitle('');
      setDescription('');
      setCategory('');
      setDepartment('');
      setUploadedFiles([]);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/student-dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error submitting complaint:', err);
      
      // Handle category/department mismatch error more gracefully
      const errorMsg = err.message?.toLowerCase() || '';
      if (
        errorMsg.includes('category') ||
        errorMsg.includes('not allowed') ||
        errorMsg.includes('operator does not exist')
      ) {
        const categoryLabel = categories.find((c) => c.value === category)?.label || category;
        setError(
          `The "${categoryLabel}" category cannot be submitted to the "${department}" department. ` +
          `Please select a compatible department for this category.`
        );
      } else {
        setError(err.message || text[language].errorOccurred);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-3xl">
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 mx-auto text-green-600 dark:text-green-400" />
              <h3 className="text-xl font-bold text-green-900 dark:text-green-100">
                {text[language].successMessage}
              </h3>
              <p className="text-green-800 dark:text-green-200">
                {text[language].successDescription}
              </p>
              <Button onClick={() => navigate('/student-dashboard')} className="mt-4">
                {text[language].backToDashboard}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>{text[language].title}</CardTitle>
          <CardDescription>{text[language].subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Complaint Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                {text[language].complaintTitle}
              </label>
              <input
                id="title"
                type="text"
                placeholder={text[language].titlePlaceholder}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                {text[language].description}
              </label>
              <textarea
                id="description"
                placeholder={text[language].descriptionPlaceholder}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                required
                className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 resize-none"
              />
            </div>

            {/* Category and Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                  {text[language].category}
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setDepartment(''); // Reset department when category changes
                  }}
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                >
                  <option value="">{text[language].selectCategory}</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                  {text[language].department}
                </label>
                <select
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={!category || departmentsLoading || categoryDepartments.length === 0}
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {categoryDepartments.length === 0 && category
                      ? text[language].noDepartmentsAvailable
                      : text[language].selectDepartment}
                  </option>
                  {categoryDepartments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Upload Evidence */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                {text[language].uploadEvidence}
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer bg-gray-50 dark:bg-slate-900/50">
                <Upload className="w-12 h-12 mx-auto text-gray-400 dark:text-slate-500 mb-2" />
                <p className="text-gray-600 dark:text-slate-400 text-sm">{text[language].uploadDesc}</p>
                <input
                  type="file"
                  id="file-input"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  {text[language].chooseFiles}
                </Button>
              </div>

              {/* Display uploaded files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-slate-800 rounded-lg">
                      <span className="text-sm text-gray-700 dark:text-slate-300 truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit and Cancel buttons */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 gap-2"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Submitting...' : text[language].submit}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/student-dashboard')}
              >
                {text[language].cancel}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}