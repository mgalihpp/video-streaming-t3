"use client";

import { EngagementType } from "@prisma/client";
import { useState } from "react";

interface useEngagementProps {
  EngagementData: {
    id: string;
    likes: number;
    dislikes: number;
  };
  viewer: {
    hasLiked: boolean;
    hasDisliked: boolean;
  };
  addLikeMutation: {
    mutate: (input: { id: string }) => void;
  };
  addDislikeMutation: {
    mutate: (input: { id: string }) => void;
  };
}

export function useEngagementButton({
  EngagementData,
  viewer,
  addDislikeMutation,
  addLikeMutation,
}: useEngagementProps) {
  const [likeCount, setLikeCount] = useState(EngagementData.likes);
  const [dislikeCount, setDislikeCount] = useState(EngagementData.dislikes);
  const [userChoice, setUserChoice] = useState({
    like: viewer.hasLiked,
    dislike: viewer.hasDisliked,
  });

  const handleEngagement =
    (
      engagementType: EngagementType,
      mutateFn: {
        mutate: (input: { id: string }) => void;
      },
    ) =>
    (input: { id: string }) => {
      const { like, dislike } = userChoice;
      const isLikeEngagement = engagementType === EngagementType.LIKE;

      if (isLikeEngagement) {
        if (like) {
          setLikeCount(likeCount - 1);
          setUserChoice({ like: false, dislike });
        } else {
          if (dislike) {
            setDislikeCount(dislikeCount - 1);
          }

          setLikeCount(likeCount + 1);
          setUserChoice({ like: true, dislike: false });
        }
      } else {
        if (dislike) {
          setDislikeCount(dislikeCount - 1);
          setUserChoice({ like, dislike: false });
        } else {
          if (like) {
            setLikeCount(likeCount - 1);
          }
          setDislikeCount(dislikeCount + 1);
          setUserChoice({ like: false, dislike: true });
        }
      }
      mutateFn.mutate(input);
    };

  const handleLike = handleEngagement(EngagementType.LIKE, addLikeMutation);
  const handleDislike = handleEngagement(
    EngagementType.DISLIKE,
    addDislikeMutation,
  );

  return {
    likeCount,
    dislikeCount,
    userChoice,
    handleLike,
    handleDislike,
  };
}
