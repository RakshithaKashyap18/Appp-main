import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Play, Pause, Clock } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Video {
  id: string;
  title: string;
  url: string;
}

interface MultiVideoPlayerProps {
  videos: Video[];
  enrollmentId: string;
  completedVideoIds: string[];
  onVideoComplete?: () => void;
}

export default function MultiVideoPlayer({ 
  videos = [], 
  enrollmentId, 
  completedVideoIds = [],
  onVideoComplete 
}: MultiVideoPlayerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedVideoId, setSelectedVideoId] = useState(videos[0]?.id || "");

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const markVideoCompleteMutation = useMutation({
    mutationFn: async (videoId: string) => {
      await apiRequest("POST", `/api/enrollments/${enrollmentId}/video-complete`, {
        videoId
      });
    },
    onSuccess: () => {
      toast({
        title: "Video Completed! 🎉",
        description: "Great progress! You're one step closer to completing the course.",
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

  const selectedVideo = videos.find(v => v.id === selectedVideoId) || videos[0];
  const videoId = selectedVideo ? getYouTubeId(selectedVideo.url) : null;
  const completedCount = completedVideoIds.length;
  const progressPercentage = Math.round((completedCount / videos.length) * 100);

  if (!selectedVideo || !videoId) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No valid video found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Course Progress</span>
            <Badge variant="secondary">
              {completedCount} of {videos.length} videos completed
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videos.map((video, index) => {
          const isCompleted = completedVideoIds.includes(video.id);
          const isSelected = video.id === selectedVideoId;
          
          return (
            <Card 
              key={video.id}
              className={`cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-blue-500' : ''
              } ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}
              onClick={() => setSelectedVideoId(video.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <Play className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Video {index + 1}: {video.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {isCompleted ? "Completed" : "Not started"}
                      </p>
                    </div>
                  </div>
                  <Badge variant={isCompleted ? "default" : "outline"}>
                    50%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Video Player */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Now Playing: {selectedVideo.title}</span>
            {completedVideoIds.includes(selectedVideoId) ? (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                Completed
              </Badge>
            ) : (
              <Badge variant="outline">
                <Clock className="h-4 w-4 mr-1" />
                In Progress
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* YouTube Embed */}
            <div className="relative aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                title={selectedVideo.title}
                className="absolute inset-0 w-full h-full rounded-lg"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>

            {/* Action Button */}
            <div className="flex justify-center">
              {!completedVideoIds.includes(selectedVideoId) ? (
                <Button
                  onClick={() => markVideoCompleteMutation.mutate(selectedVideoId)}
                  disabled={markVideoCompleteMutation.isPending}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {markVideoCompleteMutation.isPending ? "Marking Complete..." : "Mark as Complete"}
                </Button>
              ) : (
                <div className="text-center text-green-600 font-medium">
                  ✓ Video completed! Great job!
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}