import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, Volume2, VolumeX, Maximize, CheckCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface YouTubePlayerProps {
  videoUrl: string;
  enrollmentId: string;
  onVideoComplete?: () => void;
}

export default function YouTubePlayer({ videoUrl, enrollmentId, onVideoComplete }: YouTubePlayerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Extract YouTube video ID from URL
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYouTubeId(videoUrl);

  const markVideoCompleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/enrollments/${enrollmentId}/video-complete`);
    },
    onSuccess: () => {
      setIsCompleted(true);
      toast({
        title: "Video Completed! 🎉",
        description: "Great job! You can now take the test to complete the course.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
      onVideoComplete?.();
    },
    onError: (error) => {
      console.error("Error marking video complete:", error);
      toast({
        title: "Error",
        description: "Failed to mark video as complete. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Simulate video progress tracking when playing
  useEffect(() => {
    if (!isCompleted && isPlaying) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            // Auto-complete when reaching 95%
            if (!isCompleted) {
              markVideoCompleteMutation.mutate();
            }
            return 100;
          }
          return prev + 0.5; // Slower progress increment
        });
      }, 1000); // Update every second

      return () => clearInterval(interval);
    }
  }, [isCompleted, isPlaying, markVideoCompleteMutation]);

  // Start playing automatically after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPlaying(true);
    }, 2000); // Start playing after 2 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!videoId) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Invalid YouTube URL. Please contact support.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-0">
        <div className="relative">
          {/* YouTube Embed */}
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1`}
              title="Course Video"
              className="absolute top-0 left-0 w-full h-full rounded-t-lg"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Progress Overlay */}
          <div className="p-4 bg-gray-50 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Video Progress: {Math.round(progress)}%
              </span>
              {isCompleted && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-1" />
                  <span className="text-sm font-medium">Completed!</span>
                </div>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isCompleted ? "bg-green-500" : "bg-blue-500"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={isCompleted}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-1" />
                      Play
                    </>
                  )}
                </Button>
                
                <div className="text-sm text-gray-600">
                  {isCompleted ? "Video completed!" : "Watch the complete video to unlock the test"}
                </div>
              </div>
              
              {progress >= 95 && !isCompleted && (
                <Button
                  onClick={() => markVideoCompleteMutation.mutate()}
                  disabled={markVideoCompleteMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {markVideoCompleteMutation.isPending ? "Completing..." : "Mark Complete"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}