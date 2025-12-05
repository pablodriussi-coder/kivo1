import React, { useState, useMemo } from 'react';
import { Project, User } from '../types';
import { Plus, FolderOpen, Calendar, ChevronRight, MoreVertical, Trash2, Edit2, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface DashboardProps {
  user: User;
  projects: Project[];
  onCreateProject: (name: string, description: string) => void;
  onSelectProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onRenameProject: (id: string, name: string, description: string) => void;
}

type SortOption = 'date' | 'name';
type SortOrder = 'asc' | 'desc';

export const Dashboard: React.FC<DashboardProps> = ({ 
    user, 
    projects, 
    onCreateProject, 
    onSelectProject, 
    onDeleteProject, 
    onRenameProject 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Search and Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Derived state for filtered and sorted projects
  const processedProjects = useMemo(() => {
    let result = [...projects];

    // Filter
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(lowerTerm) || 
        p.description.toLowerCase().includes(lowerTerm)
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = a.createdAt - b.createdAt;
      } else {
        comparison = a.title.localeCompare(b.title);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [projects, searchTerm, sortBy, sortOrder]);

  const openCreateModal = () => {
      setEditingProject(null);
      setNewTitle('');
      setNewDesc('');
      setIsModalOpen(true);
  };

  const openEditModal = (e: React.MouseEvent, project: Project) => {
      e.stopPropagation();
      setActiveMenuId(null);
      setEditingProject(project);
      setNewTitle(project.title);
      setNewDesc(project.description);
      setIsModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setActiveMenuId(null);
      onDeleteProject(id);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      if (editingProject) {
          onRenameProject(editingProject.id, newTitle, newDesc);
      } else {
          onCreateProject(newTitle, newDesc);
      }
      setIsModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      setEditingProject(null);
    }
  };

  const toggleMenu = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setActiveMenuId(activeMenuId === id ? null : id);
  };

  const toggleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortOrder('desc'); // Default to newest/Z-A when switching
    }
  };

  // Close menus when clicking outside
  React.useEffect(() => {
      const closeMenu = () => setActiveMenuId(null);
      window.addEventListener('click', closeMenu);
      return () => window.removeEventListener('click', closeMenu);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mis Proyectos</h1>
          <p className="text-gray-500 dark:text-gray-400">Gestiona tus evaluaciones de accesibilidad</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          <span className="">Nuevo Proyecto</span>
        </button>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar proyectos..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => toggleSort('date')}
             className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${sortBy === 'date' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/50 dark:border-indigo-700 dark:text-indigo-300' : 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'}`}
           >
             <Calendar className="w-4 h-4" />
             Fecha
             {sortBy === 'date' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
           </button>
           <button 
             onClick={() => toggleSort('name')}
             className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${sortBy === 'name' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/50 dark:border-indigo-700 dark:text-indigo-300' : 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'}`}
           >
             <ArrowUpDown className="w-4 h-4" />
             Nombre
             {sortBy === 'name' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
           </button>
        </div>
      </div>

      {processedProjects.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="bg-indigo-50 dark:bg-indigo-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm ? 'No se encontraron proyectos' : 'No tienes proyectos aún'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
            {searchTerm ? 'Intenta con otros términos de búsqueda.' : 'Crea tu primer proyecto para comenzar a evaluar la accesibilidad.'}
          </p>
          {!searchTerm && (
            <button
              onClick={openCreateModal}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              Crear Proyecto Ahora &rarr;
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedProjects.map((project) => (
            <div 
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500 transition-all group relative"
            >
              <div className="flex justify-between items-start mb-4 relative">
                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                  <FolderOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-full border border-gray-100 dark:border-gray-600">
                        {project.analyses.length} Análisis
                    </span>
                    <button 
                        onClick={(e) => toggleMenu(e, project.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {activeMenuId === project.id && (
                        <div className="absolute right-0 top-8 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg py-1 z-20 animate-fade-in">
                            <button 
                                onClick={(e) => openEditModal(e, project)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                                <Edit2 className="w-3 h-3" /> Editar
                            </button>
                            <button 
                                onClick={(e) => handleDeleteClick(e, project.id)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                            >
                                <Trash2 className="w-3 h-3" /> Eliminar
                            </button>
                        </div>
                    )}
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 pr-4">
                {project.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                {project.description || "Sin descripción"}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(project.createdAt).toLocaleDateString()}
                </div>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl animate-scale-in border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}
            </h2>
            <form onSubmit={handleModalSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Proyecto</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ej. Oficina Central"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    rows={3}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Evaluación de accesibilidad de la entrada principal..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  {editingProject ? 'Guardar Cambios' : 'Crear Proyecto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};