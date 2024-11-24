import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Copy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { LoadingState } from './LoadingState';
import { ErrorMessage } from './ErrorMessage';
import { ConfirmDialog } from './ConfirmDialog';
import type { ReportTemplate } from '../lib/reportTemplates';

export function ReportTemplateManager() {
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['report-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  const createTemplate = useMutation({
    mutationFn: async (template: Omit<ReportTemplate, 'id'>) => {
      const { data, error } = await supabase
        .from('report_templates')
        .insert(template)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-templates'] });
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async (template: ReportTemplate) => {
      const { data, error } = await supabase
        .from('report_templates')
        .update(template)
        .eq('id', template.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-templates'] });
      setEditingTemplate(null);
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('report_templates')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-templates'] });
    },
  });

  const duplicateTemplate = useMutation({
    mutationFn: async (template: ReportTemplate) => {
      const { data, error } = await supabase
        .from('report_templates')
        .insert({
          ...template,
          name: `${template.name} (Copy)`,
          id: undefined,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-templates'] });
    },
  });

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Report Templates</h2>
        <Button onClick={() => setEditingTemplate({} as ReportTemplate)}>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates?.map((template) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {template.description}
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => duplicateTemplate.mutate(template)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingTemplate(template)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDelete(template.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Template Editor Dialog */}
      {editingTemplate && (
        <TemplateEditor
          template={editingTemplate}
          onSave={(template) => {
            if (template.id) {
              updateTemplate.mutate(template);
            } else {
              createTemplate.mutate(template);
            }
          }}
          onCancel={() => setEditingTemplate(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) {
            deleteTemplate.mutate(confirmDelete);
          }
          setConfirmDelete(null);
        }}
        title="Delete Template"
        message="Are you sure you want to delete this template? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
}

function TemplateEditor({
  template,
  onSave,
  onCancel,
}: {
  template: ReportTemplate;
  onSave: (template: ReportTemplate) => void;
  onCancel: () => void;
}) {
  // Template editor implementation
  return null; // Placeholder
} 