"use client";

import { useState, useEffect } from "react";
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
  Client,
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
  updateCustomFieldDefinition,
  deleteCustomFieldDefinition,
  getClients,
  createClient,
  updateClient,
  deleteClient,
} from "@/lib/supabase/api";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("explorar");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Data states
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<CommercialCategory[]>([]);
  const [tags, setTags] = useState<JobTag[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  // Job currently being edited in form tab
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // Load dataset
  const loadAllData = async () => {
    try {
      const [fetchedJobs, fetchedCats, fetchedTags, fetchedFields, fetchedClients] =
        await Promise.all([
          getJobs(),
          getCommercialCategories(),
          getJobTags(),
          getCustomFieldDefinitions(),
          getClients(),
        ]);

      setJobs(fetchedJobs);
      setCategories(fetchedCats);
      setTags(fetchedTags);
      setCustomFields(fetchedFields);
      setClients(fetchedClients);
    } catch (err) {
      console.error("Error loading portfolio database data:", err);
      showToast("Erro ao carregar os dados. Verifique a conexão com o Supabase.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Job Handlers
  const handleSaveJob = async (formData: JobFormData) => {
    try {
      if (editingJob) {
        await updateJob(editingJob.id, formData);
        setEditingJob(null);
      } else {
        await createJob(formData);
      }
      await loadAllData();
      setActiveTab("explorar");
      showToast(editingJob ? "Trabalho atualizado com sucesso!" : "Trabalho criado com sucesso!", 'success');
    } catch (err) {
      console.error("Error saving job:", err);
      showToast("Erro ao salvar o trabalho. Tente novamente.");
    }
  };

  const handleEditJobClick = (job: Job) => {
    setEditingJob(job);
    setActiveTab("novo");
  };

  const handleDeleteJobClick = async (id: string) => {
    try {
      await deleteJob(id);
      await loadAllData();
      showToast("Trabalho removido.", 'success');
    } catch (err) {
      console.error("Error deleting job:", err);
      showToast("Erro ao remover o trabalho. Tente novamente.");
    }
  };

  // Category Handlers
  const handleCreateCategory = async (name: string, color: string) => {
    try {
      const created = await createCommercialCategory(name, color);
      await loadAllData();
      return created;
    } catch (err) {
      console.error("Error creating category:", err);
      showToast("Erro ao criar categoria.");
      throw err;
    }
  };

  const handleUpdateCategory = async (
    id: string,
    name: string,
    color: string,
  ) => {
    try {
      await updateCommercialCategory(id, name, color);
      await loadAllData();
    } catch (err) {
      console.error("Error updating category:", err);
      showToast("Erro ao atualizar categoria.");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCommercialCategory(id);
      await loadAllData();
    } catch (err) {
      console.error("Error deleting category:", err);
      showToast("Erro ao remover categoria.");
    }
  };

  // Tag Handlers
  const handleCreateTag = async (name: string, color: string) => {
    try {
      const created = await createJobTag(name, color);
      await loadAllData();
      return created;
    } catch (err) {
      console.error("Error creating tag:", err);
      showToast("Erro ao criar tag.");
      throw err;
    }
  };

  const handleUpdateTag = async (id: string, name: string, color: string) => {
    try {
      await updateJobTag(id, name, color);
      await loadAllData();
    } catch (err) {
      console.error("Error updating tag:", err);
      showToast("Erro ao atualizar tag.");
    }
  };

  const handleDeleteTag = async (id: string) => {
    try {
      await deleteJobTag(id);
      await loadAllData();
    } catch (err) {
      console.error("Error deleting tag:", err);
      showToast("Erro ao remover tag.");
    }
  };

  // Custom Field Handlers
  const handleCreateCustomField = async (
    label: string,
    key: string,
    fieldType: CustomFieldDefinition["field_type"],
    options: string[],
  ) => {
    try {
      const created = await createCustomFieldDefinition(
        label,
        key,
        fieldType,
        options,
      );
      await loadAllData();
      return created;
    } catch (err) {
      console.error("Error creating custom field:", err);
      showToast("Erro ao criar campo personalizado.");
      throw err;
    }
  };

  const handleUpdateCustomField = async (
    id: string,
    label: string,
    key: string,
    fieldType: CustomFieldDefinition["field_type"],
    options: string[],
  ) => {
    try {
      await updateCustomFieldDefinition(id, label, key, fieldType, options);
      await loadAllData();
      showToast("Campo personalizado atualizado!", 'success');
    } catch (err) {
      console.error("Error updating custom field:", err);
      showToast("Erro ao atualizar campo personalizado.");
      throw err;
    }
  };

  const handleDeleteCustomField = async (id: string) => {
    try {
      await deleteCustomFieldDefinition(id);
      await loadAllData();
    } catch (err) {
      console.error("Error deleting custom field:", err);
      showToast("Erro ao remover campo personalizado.");
    }
  };

  // Client Handlers
  const handleCreateClient = async (data: { name: string; email?: string; phone?: string; notes?: string }) => {
    try {
      await createClient(data.name, data.email, data.phone, data.notes);
      await loadAllData();
      showToast("Cliente cadastrado com sucesso!", 'success');
    } catch (err) {
      console.error("Error creating client:", err);
      showToast("Erro ao cadastrar cliente.");
      throw err;
    }
  };

  const handleUpdateClient = async (id: string, data: { name: string; email?: string; phone?: string; notes?: string }) => {
    try {
      await updateClient(id, data.name, data.email, data.phone, data.notes);
      await loadAllData();
      showToast("Cliente atualizado com sucesso!", 'success');
    } catch (err) {
      console.error("Error updating client:", err);
      showToast("Erro ao atualizar cliente.");
      throw err;
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      await deleteClient(id);
      await loadAllData();
      showToast("Cliente removido.", 'success');
    } catch (err) {
      console.error("Error deleting client:", err);
      showToast("Erro ao remover cliente.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium border transition-all animate-in fade-in slide-in-from-bottom-4 duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-950 border-emerald-500/30 text-emerald-300'
              : 'bg-red-950 border-red-500/30 text-red-300'
          }`}
        >
          <span className={`h-2 w-2 rounded-full flex-shrink-0 ${toast.type === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`} />
          {toast.message}
        </div>
      )}

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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 lg:py-8">
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
                clients={clients}
                onCreateCategory={handleCreateCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
                onCreateTag={handleCreateTag}
                onUpdateTag={handleUpdateTag}
                onDeleteTag={handleDeleteTag}
                onCreateCustomField={handleCreateCustomField}
                onUpdateCustomField={handleUpdateCustomField}
                onDeleteCustomField={handleDeleteCustomField}
                onCreateClient={handleCreateClient}
                onUpdateClient={handleUpdateClient}
                onDeleteClient={handleDeleteClient}
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
