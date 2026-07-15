import { getProjects, getPillars, getExperiences, getLogs } from "@/lib/data";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return <div>Unauthorized</div>;
  }

  const projects = await getProjects();
  const pillars = await getPillars();
  const experiences = await getExperiences();
  const logs = await getLogs();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Dashboard Overview</h1>
          <p className="text-slate-400 mt-2">Manage your portfolio content.</p>
        </div>
      </div>
      
      <AdminTabs 
        projects={projects} 
        pillars={pillars} 
        experiences={experiences} 
        logs={logs}
        userEmail={session.user.email!}
      />
    </div>
  );
}
