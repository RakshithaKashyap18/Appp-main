import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, XCircle, Award, RotateCcw } from "lucide-react";

interface CourseTestProps {
  enrollmentId: string;
  courseTitle: string;
  onTestComplete?: (passed: boolean, score: number) => void;
}

// Sample test questions - in real app, these would come from the course data
const sampleQuestions = [
  {
    id: 1,
    question: "What is the primary purpose of machine learning?",
    options: [
      "To replace human intelligence completely",
      "To enable computers to learn and make decisions from data",
      "To create robots",
      "To build websites"
    ],
    correctAnswer: 1
  },
  {
    id: 2,
    question: "Which of the following is a supervised learning algorithm?",
    options: [
      "K-means clustering",
      "Linear regression",
      "DBSCAN",
      "PCA"
    ],
    correctAnswer: 1
  },
  {
    id: 3,
    question: "What does 'overfitting' mean in machine learning?",
    options: [
      "The model performs well on training data but poorly on new data",
      "The model is too simple",
      "The model has too few parameters",
      "The model trains too quickly"
    ],
    correctAnswer: 0
  },
  {
    id: 4,
    question: "Which metric is commonly used for classification problems?",
    options: [
      "Mean Squared Error",
      "R-squared",
      "Accuracy",
      "Mean Absolute Error"
    ],
    correctAnswer: 2
  },
  {
    id: 5,
    question: "What is the purpose of a validation set?",
    options: [
      "To train the model",
      "To test the final model performance",
      "To tune hyperparameters and prevent overfitting",
      "To clean the data"
    ],
    correctAnswer: 2
  }
];

export default function CourseTest({ enrollmentId, courseTitle, onTestComplete }: CourseTestProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [testScore, setTestScore] = useState(0);
  const [testPassed, setTestPassed] = useState(false);

  const submitTestMutation = useMutation({
    mutationFn: async (testData: { answers: { [key: number]: number }; score: number; passed: boolean }) => {
      const response = await apiRequest("POST", `/api/enrollments/${enrollmentId}/test-complete`, testData);
      return response.json();
    },
    onSuccess: (data) => {
      setShowResults(true);
      setTestPassed(data.passed);
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
      onTestComplete?.(data.passed, testScore);
      
      if (data.passed) {
        toast({
          title: "Course Completed!",
          description: `You passed with ${testScore}%! Course completed and earned ${data.pointsAwarded} points.`,
        });
      } else {
        toast({
          title: "Keep Learning!",
          description: `You scored ${testScore}%. You need 70% to complete the course. Try again!`,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error("Error submitting test:", error);
      toast({
        title: "Error",
        description: "Failed to submit test. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleNext = () => {
    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmitTest = () => {
    // Calculate score
    let correct = 0;
    sampleQuestions.forEach((question, index) => {
      if (answers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    
    const score = Math.round((correct / sampleQuestions.length) * 100);
    const passed = score >= 70; // 70% to pass
    setTestScore(score);
    
    submitTestMutation.mutate({ answers, score, passed });
  };

  const handleRetakeTest = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setTestScore(0);
    setTestPassed(false);
  };

  const progress = ((currentQuestion + 1) / sampleQuestions.length) * 100;
  const allQuestionsAnswered = sampleQuestions.every(q => answers[q.id] !== undefined);

  if (showResults) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Test Results - {courseTitle}</span>
            {testPassed ? (
              <Badge className="bg-green-600">Passed</Badge>
            ) : (
              <Badge variant="destructive">Not Passed</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            {testPassed ? (
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            ) : (
              <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            )}
            
            <h3 className="text-2xl font-bold mb-2">
              Your Score: {testScore}%
            </h3>
            
            <p className="text-gray-600 mb-4">
              {testPassed 
                ? "Congratulations! You have successfully completed this course."
                : "You need 70% to pass. Review the material and try again."
              }
            </p>

            {testPassed && (
              <div className="flex items-center justify-center space-x-2 text-blue-600 mb-4">
                <Award className="h-5 w-5" />
                <span className="font-medium">Course Completed!</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {sampleQuestions.filter((q, i) => answers[q.id] === q.correctAnswer).length}
              </div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {sampleQuestions.length - sampleQuestions.filter((q, i) => answers[q.id] === q.correctAnswer).length}
              </div>
              <div className="text-sm text-gray-600">Incorrect Answers</div>
            </div>
          </div>

          {!testPassed && (
            <div className="text-center">
              <Button onClick={handleRetakeTest} className="mr-4">
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Test
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const currentQ = sampleQuestions[currentQuestion];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Course Test - {courseTitle}</span>
          <Badge variant="outline">
            Question {currentQuestion + 1} of {sampleQuestions.length}
          </Badge>
        </CardTitle>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {currentQ.question}
          </h3>
          
          <RadioGroup
            value={answers[currentQ.id]?.toString()}
            onValueChange={(value) => handleAnswerSelect(currentQ.id, parseInt(value))}
          >
            {currentQ.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label 
                  htmlFor={`option-${index}`} 
                  className="flex-1 cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          
          <div className="text-sm text-gray-500">
            {Object.keys(answers).length} of {sampleQuestions.length} questions answered
          </div>
          
          {currentQuestion === sampleQuestions.length - 1 ? (
            <Button
              onClick={handleSubmitTest}
              disabled={!allQuestionsAnswered || submitTestMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitTestMutation.isPending ? "Submitting..." : "Submit Test"}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={answers[currentQ.id] === undefined}
            >
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}