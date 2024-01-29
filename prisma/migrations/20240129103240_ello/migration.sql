-- CreateTable
CREATE TABLE "RepliesComment" (
    "id" TEXT NOT NULL,
    "message" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepliesComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentHasReplies" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "repliesCommentId" TEXT,

    CONSTRAINT "CommentHasReplies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RepliesComment_userId_idx" ON "RepliesComment"("userId");

-- CreateIndex
CREATE INDEX "CommentHasReplies_commentId_repliesCommentId_idx" ON "CommentHasReplies"("commentId", "repliesCommentId");

-- CreateIndex
CREATE INDEX "CommentHasReplies_commentId_idx" ON "CommentHasReplies"("commentId");

-- CreateIndex
CREATE INDEX "CommentHasReplies_repliesCommentId_idx" ON "CommentHasReplies"("repliesCommentId");
