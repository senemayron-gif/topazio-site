"use client";

import { useState, useRef, useEffect } from 'react';
import { Hammer, MessageCircle, Lock, X, ChevronRight, ChevronLeft, Camera, Trash2, Edit3, PlusCircle, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

const CATEGORIES = ["BANHEIRO", "COZINHA", "SALA", "HALL DE ENTRADA", "QUARTO SIMPLES", "QUARTO CLOSET"];

export default function Page() {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false); 
  const [password, setPassword] = useState("");
  const [activeCategory, setActiveCategory] = useState("BANHEIRO");
  const [editingId, setEditingId] = useState<number | string | null>(null);
  
  const [backgroundImage, setBackgroundImage] = useState("https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1920");

  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("COZINHA");
  const [newMaterial, setNewMaterial] = useState("");
  const [newDescription, setNewDescription] = useState(""); 
  
  const [previewMedia, setPreviewMedia] = useState<{ url: string, type: 'image' | 'video' }[]>([]);
  const [carouselIndices, setCarouselIndices] = useState<{[key: string]: number}>({});
  const [projects, setProjects] = useState<any[]>([]);

  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const { data, error } = await supabase
        .from('projetos')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      if (data) {
        const formatted = data.map((p: any) => ({
          ...p,
          images: p.images || (p.imagem_url ? [{ url: p.imagem_url, type: 'image' }] : [])
        }));
        setProjects(formatted);
      }
    } catch (err) {
      console.error("Erro ao buscar projetos:", err);
    }
  }

  const handleNextImage = (projId: any, max: number) => {
    setCarouselIndices(prev => ({ ...prev, [projId]: ((prev[projId] || 0) + 1) % max }));
  };

  const handlePrevImage = (projId: any, max: number) => {
    setCarouselIndices(prev => ({ ...prev, [projId]: ((prev[projId] || 0) - 1 + max) % max }));
  };

  // AJUSTE AQUI: Melhorado processamento de arquivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const filesArray = Array.from(files);
      const promises = filesArray.map(file => {
        return new Promise<{ url: string, type: 'image' | 'video' }>((resolve) => {
          const isVideo = file.type.startsWith('video/');
          const reader = new FileReader();
          reader.onloadend = () => resolve({ url: reader.result as string, type: isVideo ? 'video' : 'image' });
          reader.readAsDataURL(file);
        });
      });

      Promise.all(promises).then(results => {
        setPreviewMedia(prev => [...prev, ...results]);
        // LIMPA O INPUT para permitir selecionar o mesmo arquivo novamente se necessário
        if (fileInput.current) fileInput.current.value = "";
      });
    }
  };

  const handlePublish = async () => {
    if (!newTitle || previewMedia.length === 0) return alert("Preencha o título e selecione pelo menos uma foto!");
    
    const projectData = {
      titulo: newTitle,
      categoria: newCategory,
      material: newMaterial,
      descricao: newDescription, 
      imagem_url: previewMedia[0].url,
      images: [...previewMedia] 
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from('projetos')
          .update(projectData)
          .eq('id', editingId);

        if (error) throw error;
        alert("Projeto atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from('projetos')
          .insert([projectData]);
        if (error) throw error;
        alert("Projeto publicado com sucesso!");
      }

      setNewTitle(""); 
      setNewMaterial(""); 
      setNewDescription(""); 
      setPreviewMedia([]);
      setEditingId(null);
      setShowAddModal(false);
      await fetchProjects();
    } catch (err: any) {
      alert("Erro no Supabase: " + err.message);
    }
  };

  // ... (restante das funções deleteProject e startEdit permanecem iguais)

  return (
    <main className="min-h-screen font-sans text-zinc-900 relative">
      {/* ... (Nav e Sections de Projetos) */}
      
      {showAddModal && (
        <div className="fixed inset-0 bg-black/90 z-[60] overflow-y-auto p-4 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-zinc-900 text-white p-8 rounded-[3rem] w-full max-w-2xl border border-zinc-800 shadow-2xl my-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-yellow-500 uppercase italic tracking-tighter">
                {editingId ? "Editar Projeto" : "Novo Projeto"}
              </h2>
              <button onClick={() => {setShowAddModal(false); setEditingId(null); setPreviewMedia([]); setNewTitle(""); setNewMaterial(""); setNewDescription("");}} className="text-white hover:bg-red-600 p-2 bg-zinc-800 rounded-full transition-colors"><X/></button>
            </div>

            <div className="space-y-6">
              <div className="bg-zinc-800 p-6 rounded-2xl border border-zinc-700">
                <div className="space-y-4">
                  {/* Inputs de texto */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input className="bg-zinc-900 p-5 rounded-xl border border-zinc-700 text-white font-bold outline-none focus:border-yellow-500" placeholder="Título do Projeto" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                    <select className="bg-zinc-900 p-5 rounded-xl border border-zinc-700 text-white font-black outline-none focus:border-yellow-500" value={newCategory} onChange={e => setNewCategory(e.target.value)}>
                      {CATEGORIES.map(c => <option key={c} value={c} className="bg-zinc-900">{c}</option>)}
                    </select>
                  </div>
                  <input className="w-full bg-zinc-900 p-5 rounded-xl border border-zinc-700 text-white font-bold outline-none focus:border-yellow-500" placeholder="Material" value={newMaterial} onChange={e => setNewMaterial(e.target.value)} />
                  <textarea className="w-full bg-zinc-900 p-5 rounded-xl border border-zinc-700 text-white font-medium h-24 resize-none outline-none focus:border-yellow-500" placeholder="Descrição curta..." value={newDescription} onChange={e => setNewDescription(e.target.value)} />
                  
                  {/* FEEDBACK DE MÍDIAS SELECIONADAS */}
                  {previewMedia.length > 0 && (
                    <div className="flex flex-col items-center p-2 bg-zinc-900/50 rounded-xl">
                      <p className="text-yellow-500 text-[10px] font-black uppercase mb-1">
                        {previewMedia.length} mídia(s) carregada(s)
                      </p>
                      <button 
                        onClick={() => setPreviewMedia([])} 
                        className="text-red-500 text-[10px] font-black uppercase hover:underline"
                      >
                        Limpar todas as mídias
                      </button>
                    </div>
                  )}

                  {/* ÁREA DE CLIQUE PARA UPLOAD */}
                  <div 
                    onClick={() => fileInput.current?.click()} 
                    className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                      previewMedia.length > 0 ? "border-yellow-500 bg-yellow-500/5" : "border-zinc-600 hover:border-zinc-400 hover:bg-zinc-800"
                    }`}
                  >
                      <Camera className={previewMedia.length > 0 ? "text-yellow-500 mb-2" : "text-zinc-500 mb-2"} size={32} />
                      <p className="text-xs font-black text-white uppercase tracking-tighter text-center">
                        {previewMedia.length > 0 ? "Clique para adicionar mais mídias" : "Clique para selecionar várias Fotos/Vídeos"}
                      </p>
                      <input 
                        type="file" 
                        hidden 
                        ref={fileInput} 
                        multiple 
                        onChange={handleFileChange} 
                        accept="image/*,video/*" 
                      />
                  </div>

                  <button onClick={handlePublish} className="w-full bg-yellow-500 text-black py-4 rounded-xl font-black uppercase shadow-xl hover:bg-yellow-400 transition-all mt-4">
                    {editingId ? "Salvar Alterações" : "Publicar Projeto +"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ... (Admin Login Modal) */}
    </main>
  );
}