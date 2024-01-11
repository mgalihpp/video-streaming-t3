import Image from "next/image";

export default function Logo({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  return <Image src={"/logo.jpg"} alt="logo" width={width} height={height} />;
}
