import { notFound } from "next/navigation";
import pillars from "@/data/pillars.json";
import { SplitLayout } from "@/components/detail/SplitLayout";
import { StickySidebar } from "@/components/detail/StickySidebar";
import { LogTimeline } from "@/components/detail/LogTimeline";

export default async function PillarPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const pillar = pillars.find((p) => p.id === resolvedParams.slug);

  if (!pillar) {
    notFound();
  }

  return (
    <SplitLayout
      left={
        <StickySidebar 
          title={pillar.title} 
          summary={pillar.summary} 
          philosophy={pillar.philosophy} 
        />
      }
      right={
        <LogTimeline logs={pillar.logs} />
      }
    />
  );
}

export async function generateStaticParams() {
  return pillars.map((p) => ({
    slug: p.id,
  }));
}
