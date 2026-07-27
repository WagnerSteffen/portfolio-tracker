"use client";

import React, { useState, useEffect } from "react";
import { Navbar, TabType } from "@/components/layout/Navbar";
import { JobsExplorer } from "@/components/jobs/JobsExplorer";
import { JobForm } from "@/components/jobs/JobForm";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { MetadataManager } from "@/components/settings/MetadataManager";
import {
  Job,
  JobFormData,
  CommercialCategory,
  JobTag,
  CustomFieldDefinition,
} from "@/types/database";
import {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  getCommercialCategories,
  createCommercialCategory,
  updateCommercialCategory,
  deleteCommercialCategory,
  getJobTags,
  createJobTag,
  updateJobTag,
  deleteJobTag,
  getCustomFieldDefinitions,
  createCustomFieldDefinition,
  deleteCustomFieldDefinition,
} from "@/lib/supabase/api";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("explorar");
  const [loading, setLoading] = useState(true);

  // Data states
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<CommercialCategory[]>([]);
  const [tags, setTags] = useState<JobTag[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);

  // Job currently being edited in form tab
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // Load dataset
  const loadAllData = async () => {
    try {
      const [fetchedJobs, fetchedCats, fetchedTags, fetchedFields] =
        await Promise.all([
          getJobs(),
          getCommercialCategories(),
          getJobTags(),
          getCustomFieldDefinitions(),
        ]);

      setJobs(fetchedJobs);
      setCategories(fetchedCats);
      setTags(fetchedTags);
      setCustomFields(fetchedFields);
    } catch (err) {
      console.error("Error loading portfolio database data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Job Handlers
  const handleSaveJob = async (formData: JobFormData) => {
    if (editingJob) {
      await updateJob(editingJob.id, formData);
      setEditingJob(null);
    } else {
      await createJob(formData);
    }
    await loadAllData();
    setActiveTab("explorar");
  };

  const handleEditJobClick = (job: Job) => {
    setEditingJob(job);
    setActiveTab("novo");
  };

  const handleDeleteJobClick = async (id: string) => {
    await deleteJob(id);
    await loadAllData();
  };

  // Category Handlers
  const handleCreateCategory = async (name: string, color: string) => {
    const created = await createCommercialCategory(name, color);
    await loadAllData();
    return created;
  };

  const handleUpdateCategory = async (
    id: string,
    name: string,
    color: string,
  ) => {
    await updateCommercialCategory(id, name, color);
    await loadAllData();
  };

  const handleDeleteCategory = async (id: string) => {
    await deleteCommercialCategory(id);
    await loadAllData();
  };

  // Tag Handlers
  const handleCreateTag = async (name: string, color: string) => {
    const created = await createJobTag(name, color);
    await loadAllData();
    return created;
  };

  const handleUpdateTag = async (id: string, name: string, color: string) => {
    await updateJobTag(id, name, color);
    await loadAllData();
  };

  const handleDeleteTag = async (id: string) => {
    await deleteJobTag(id);
    await loadAllData();
  };

  // Custom Field Handlers
  const handleCreateCustomField = async (
    label: string,
    key: string,
    fieldType: CustomFieldDefinition["field_type"],
    options: string[],
  ) => {
    const created = await createCustomFieldDefinition(
      label,
      key,
      fieldType,
      options,
    );
    await loadAllData();
    return created;
  };

  const handleDeleteCustomField = async (id: string) => {
    await deleteCustomFieldDefinition(id);
    await loadAllData();
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab !== "novo") setEditingJob(null);
          setActiveTab(tab);
        }}
        jobsCount={jobs.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4 text-zinc-400">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            <p className="text-sm font-medium">
              Carregando base de dados do portfólio...
            </p>
          </div>
        ) : (
          <>
            {activeTab === "explorar" && (
              <JobsExplorer
                jobs={jobs}
                categories={categories}
                tags={tags}
                customFields={customFields}
                onEditJob={handleEditJobClick}
                onDeleteJob={handleDeleteJobClick}
                onAddNewJob={() => {
                  setEditingJob(null);
                  setActiveTab("novo");
                }}
              />
            )}

            {activeTab === "novo" && (
              <JobForm
                initialData={editingJob}
                categories={categories}
                tags={tags}
                customFields={customFields}
                onSaveJob={handleSaveJob}
                onCreateCategory={handleCreateCategory}
                onCreateTag={handleCreateTag}
                onCreateCustomField={handleCreateCustomField}
                onCancel={() => {
                  setEditingJob(null);
                  setActiveTab("explorar");
                }}
              />
            )}

            {activeTab === "analytics" && (
              <AnalyticsDashboard
                jobs={jobs}
                categories={categories}
                tags={tags}
              />
            )}

            {activeTab === "metadata" && (
              <MetadataManager
                categories={categories}
                tags={tags}
                customFields={customFields}
                onCreateCategory={handleCreateCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
                onCreateTag={handleCreateTag}
                onUpdateTag={handleUpdateTag}
                onDeleteTag={handleDeleteTag}
                onCreateCustomField={handleCreateCustomField}
                onDeleteCustomField={handleDeleteCustomField}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-6 text-center text-xs text-zinc-500 glass-panel">
        <p>
          Portfolio Database & Track System •{" "}
          <strong>Wagner (Fotografia)</strong> &{" "}
          <strong>Aflora Espaço Criativo</strong> • Daiana
        </p>
      </footer>
    </div>
  );
}
