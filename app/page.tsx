"use client";

import { useState, useRef, useEffect } from 'react';
import { Hammer, MessageCircle, Lock, X, ChevronRight, ChevronLeft, Camera, Trash2, Edit3, PlusCircle, Users } from 'lucide-react';
// IMPORTANTE: Importe o supabase que você configurou no projeto
import { supabase } from '@/lib/supabase'; 

const CATEGORIES = ["TODOS", "BANHEIRO", "COZINHA", "SALA", "HALL DE ENTRADA", "QUARTO SIMPLES", "QUARTO CLOSET"];

export default function TopazioSite() {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false); 
  const [password, setPassword] = useState("");
  const [activeCategory, setActiveCategory] = useState("TODOS");
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
  const bgInput = useRef<HTMLInputElement>(null);

  // --- BUSCAR DADOS DO SUPABASE ---
  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    const { data, error } = await supabase
      .from('projetos')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error("Erro ao buscar:", error);
    } else if (data) {
      // Ajusta o formato caso as imagens estejam salvas como string simples
      const formatted = data.map(p => ({
        ...p,
        images: p.images || [{ url: p.imagem_url, type: 'image' }]
      }));
      setProjects(formatted);
    }
  }

  const handleNextImage = (projId: any, max: number) => {
    setCarouselIndices(prev => ({ ...prev, [projId]: ((prev[projId] || 0) + 1) % max }));
  };

  const handlePrevImage = (projId: any, max: number) => {
    setCarouselIndices(prev => ({ ...prev, [projId]: ((prev[projId] || 0) - 1 + max) % max }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
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
      });
    }
  };

  const handleBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setBackgroundImage(reader.result as string); };
      reader.readAsDataURL(file);
      alert("Imagem de fundo atualizada!");
    }
  };

  // --- SALVAR NO SUPABASE ---
  const handlePublish = async () => {
    if (!newTitle || previewMedia.length === 0) return alert("Preencha o título e selecione pelo menos uma foto!");
    
    const projectData = {
      titulo: newTitle,
      categoria: newCategory,
      material: newMaterial,
      descricao: newDescription,
      imagem_url: previewMedia[0].url, // Pega a primeira foto para o campo principal
      images: previewMedia // Salva a array completa (Certifique-se que a coluna no Supabase é JSONB)
    };

    if (editingId) {
      const { error } = await supabase
        .from('projetos')
        .update(projectData)
        .eq('id', editingId);

      if (error) return alert("Erro ao atualizar: " + error.message);
      alert("Projeto atualizado!");
    } else {
      const { error } = await supabase
        .from('projetos')
        .insert([projectData]);

      if (error) return alert("Erro ao salvar: " + error.message);
      alert("Projeto publicado com sucesso!");
    }

    setNewTitle(""); setNewMaterial(""); setNewDescription(""); setPreviewMedia([]);
    setEditingId(null);
    setShowAddModal(false);
    fetchProjects(); // Recarrega a lista sem precisar de F5
  };

  const deleteProject = async (id: any) => {
    if(confirm("Tem certeza que deseja excluir este projeto?")) {
      const { error } = await supabase.from('projetos').delete().eq('id', id);
      if (error) return alert("Erro ao excluir");
      fetchProjects();
    }
  };

  const startEdit = (proj: any) => {
    setEditingId(proj.id);
    setNewTitle(proj.titulo);
    setNewCategory(proj.categoria || "COZINHA");
    setNewMaterial(proj.material);
    setNewDescription(proj.descricao);
    setPreviewMedia(proj.images);
    setShowAddModal(true); 
  };

  const filteredProjects = activeCategory === "TODOS" ? projects : projects.filter(p => p.categoria === activeCategory);

  return (
    <main className="min-h-screen font-sans text-zinc-900 relative">
      
      <div 
        className="fixed inset-0 z-0 opacity-30 pointer-events-none bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      <nav className="p-4 bg-white/90 backdrop-blur-md text-black flex items-center sticky top-0 z-40 shadow-sm border-b border-yellow-500/20">
        <button 
          onClick={() => isAdmin ? setShowAddModal(true) : setShowAdminLogin(true)} 
          className={`p-2 rounded-lg transition-all shadow-md ${isAdmin ? "bg-yellow-500 text-black animate-bounce" : "bg-black text-yellow-500 hover:bg-zinc-800"}`}
        >
          {isAdmin ? <PlusCircle size={24} /> : <Hammer size={24} />}
        </button>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <h1 className="font-black text-3xl leading-none uppercase italic tracking-tighter">Topázio</h1>
          <p className="text-[11px] text-zinc-600 font-bold tracking-[0.3em] uppercase">AMBIENTES PLANEJADOS</p>
          {isAdmin && <span className="text-[10px] font-black text-yellow-600 mt-1">MODO ADMINISTRADOR ATIVO</span>}
        </div>
        <button 
          onClick={() => window.open(`https://wa.me/5544998550741?text=Olá! Vi o site da Topázio e gostaria de um orçamento.`)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-black transition-all active:scale-95 shadow-lg"
        >
          <MessageCircle size={18} /> <span className="hidden md:inline">WhatsApp</span>
        </button>
      </nav>

      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-12">
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest transition-all border-2 ${
                activeCategory === cat ? "bg-zinc-900 text-yellow-500 border-zinc-900 shadow-lg" : "bg-white/50 text-zinc-600 border-zinc-300 hover:border-zinc-500"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
          {filteredProjects.map((proj) => {
            const currentIndex = carouselIndices[proj.id] || 0;
            const currentMedia = proj.images?.[currentIndex] || { url: proj.imagem_url, type: 'image' };

            return (
              <div key={proj.id} className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] overflow-hidden shadow-xl border border-white/50 group transition-all hover:shadow-2xl relative">
                
                {isAdmin && (
                  <div className="absolute top-3 right-3 z-30 flex gap-2">
                    <button onClick={() => startEdit(proj)} className="bg-white text-black p-2 rounded-lg shadow-md border border-zinc-200"><Edit3 size={18}/></button>
                    <button onClick={() => deleteProject(proj.id)} className="bg-red-600 text-white p-2 rounded-lg shadow-md"><Trash2 size={18}/></button>
                  </div>
                )}

                <div className="aspect-square relative overflow-hidden bg-zinc-200">
                  {currentMedia.type === 'video' ? (
                    <video src={currentMedia.url} controls className="w-full h-full object-cover" />
                  ) : (
                    <img src={currentMedia.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={proj.titulo} />
                  )}
                  
                  {proj.images?.length > 1 && (
                    <>
                      <button onClick={() => handlePrevImage(proj.id, proj.images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full z-20 backdrop-blur-sm transition-all"><ChevronLeft size={20}/></button>
                      <button onClick={() => handleNextImage(proj.id, proj.images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full z-20 backdrop-blur-sm transition-all"><ChevronRight size={20}/></button>
                    </>
                  )}

                  <div className="absolute top-4 left-4 bg-yellow-500 text-black text-[9px] px-3 py-1 rounded-full font-black uppercase shadow-md z-10">
                    {proj.categoria}
                  </div>
                </div>
                <div className="p-8">
                  <span className="text-zinc-500 font-black text-[10px] uppercase tracking-widest">{proj.material}</span>
                  <h3 className="text-xl font-black text-zinc-900 uppercase italic tracking-tighter mb-2">{proj.titulo}</h3>
                  {proj.descricao && <p className="text-zinc-600 text-sm font-medium italic mb-4 leading-relaxed">"{proj.descricao}"</p>}
                  
                  <button 
                     onClick={() => {
                       const ambient = proj.categoria === "TODOS" ? "projeto planejado" : proj.categoria.toLowerCase();
                       const msg = `Olá! Tenho interesse em um orçamento de um(a) ${ambient}. (Referência: ${proj.titulo})`;
                       window.open(`https://wa.me/5544998550741?text=${encodeURIComponent(msg)}`);
                     }}
                     className="w-full py-3 bg-zinc-900 text-white rounded-xl font-black flex items-center justify-center gap-2 hover:bg-yellow-500 hover:text-black transition-all"
                  >
                    Solicitar Orçamento <ChevronRight size={16}/>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SEÇÃO HISTÓRIA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <div className="relative rounded-[3rem] p-10 md:p-16 shadow-2xl overflow-hidden border border-white/10">
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center brightness-[0.3]"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1541123437800-1bb1317badc2?q=80&w=1920')` }}
          />
          
          <div className="relative z-10 text-center">
            <Users className="mx-auto text-yellow-500 mb-6" size={40} />
            <h2 className="font-black text-4xl uppercase italic tracking-tighter mb-6 text-white">Nossa História</h2>
            <div className="flex justify-center gap-3 mb-8">
               <span className="bg-white/10 backdrop-blur-sm text-white border border-white/20 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Maringá • PR</span>
               <span className="bg-yellow-500 text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">+17 Anos no Mercado</span>
            </div>
            <p className="text-zinc-100 font-medium leading-relaxed text-lg italic">
              "Na <strong className="text-yellow-500 uppercase tracking-tighter">Topázio Ambientes Planejados</strong>, transformamos sonhos em realidade com precisão e acabamento impecável. Com mais de 17 anos de experiência no mercado de Maringá, nossa missão é entregar qualidade superior e design inteligente para cada canto do seu lar."
            </p>
          </div>
        </div>
      </section>

      <footer className="relative z-10 p-20 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <h2 className="font-black text-5xl leading-none uppercase italic tracking-tighter text-zinc-900">Topázio</h2>
          <p className="text-[12px] text-zinc-800 font-black tracking-[0.4em] uppercase mt-1 mb-4">AMBIENTES PLANEJADOS</p>
          {isAdmin && (
            <button onClick={() => setIsAdmin(false)} className="mt-8 text-[11px] bg-red-600 text-white px-6 py-2 rounded-full font-black hover:bg-red-700 transition-all shadow-lg">SAIR DO MODO ADMIN</button>
          )}
        </div>
      </footer>

      {/* PAINEL ADMIN */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/90 z-[60] overflow-y-auto p-4 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-zinc-900 text-white p-8 rounded-[3rem] w-full max-w-2xl border border-zinc-800 shadow-2xl my-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-yellow-500 uppercase italic tracking-tighter">
                {editingId ? "Editar Projeto" : "Painel Administrativo"}
              </h2>
              <button onClick={() => {setShowAddModal(false); setEditingId(null); setPreviewMedia([]);}} className="text-white hover:bg-red-600 p-2 bg-zinc-800 rounded-full transition-colors"><X/></button>
            </div>

            <div className="space-y-6">
              <div className="bg-zinc-800 p-6 rounded-2xl border border-zinc-700">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input className="bg-zinc-900 p-5 rounded-xl border border-zinc-700 text-white font-bold outline-none focus:border-yellow-500" placeholder="Título do Projeto" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                    <select className="bg-zinc-900 p-5 rounded-xl border border-zinc-700 text-white font-black outline-none focus:border-yellow-500" value={newCategory} onChange={e => setNewCategory(e.target.value)}>
                      {CATEGORIES.filter(c => c !== "TODOS").map(c => <option key={c} value={c} className="bg-zinc-900">{c}</option>)}
                    </select>
                  </div>
                  <input className="w-full bg-zinc-900 p-5 rounded-xl border border-zinc-700 text-white font-bold outline-none focus:border-yellow-500" placeholder="Material (Ex: MDF Louro Freijó)" value={newMaterial} onChange={e => setNewMaterial(e.target.value)} />
                  <textarea className="w-full bg-zinc-900 p-5 rounded-xl border border-zinc-700 text-white font-medium h-24 resize-none outline-none focus:border-yellow-500" placeholder="Descrição curta..." value={newDescription} onChange={e => setNewDescription(e.target.value)} />
                  
                  <div onClick={() => fileInput.current?.click()} className="border-2 border-dashed border-zinc-600 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-800 transition-colors">
                      <Camera className="text-zinc-500 mb-2" size={32} />
                      <p className="text-xs font-black text-white uppercase tracking-tighter">Clique para selecionar várias Fotos/Vídeos</p>
                      <input type="file" hidden ref={fileInput} multiple onChange={handleFileChange} accept="image/*,video/*" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <button onClick={handlePublish} className="w-full bg-yellow-500 text-black py-4 rounded-xl font-black uppercase shadow-xl hover:bg-yellow-400 transition-all col-span-2">
                      {editingId ? "Salvar Alterações" : "Publicar Projeto +"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOGIN ADMIN */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-zinc-900 p-12 rounded-[3.5rem] w-full max-w-sm text-center border border-zinc-800 shadow-2xl relative">
            <button onClick={() => setShowAdminLogin(false)} className="absolute top-8 right-8 text-white"><X size={24}/></button>
            <Lock className="mx-auto text-yellow-500 mb-8" size={48} />
            <input 
              type="password" placeholder="SENHA" 
              className="w-full p-6 bg-zinc-800 rounded-2xl text-white text-center mb-6 border-2 border-zinc-700 focus:border-yellow-500 text-3xl font-black tracking-[0.5em] outline-none"
              value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (password === "0741" ? (setIsAdmin(true), setShowAdminLogin(false), setPassword("")) : alert("Senha Errada"))}
            />
            <button onClick={() => password === "0741" ? (setIsAdmin(true), setShowAdminLogin(false), setPassword("")) : alert("Senha Errada")} className="w-full bg-yellow-500 text-black p-6 rounded-2xl font-black text-xl uppercase shadow-lg hover:bg-yellow-400 transition-all">Entrar</button>
          </div>
        </div>
      )}
    </main>
  );
}