import { MotionDiv } from "@/components/MotionWrapper";

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm z-50">
      <MotionDiv
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8"
      >
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
        <p className="text-white mt-4 font-medium">Đang tải...</p>
      </MotionDiv>
    </div>
  );
}
