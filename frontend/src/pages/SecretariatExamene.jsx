import React ,{ useState }from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, List, Download,LogOut,Settings } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import ExamenLimiteModal from './ExamenLimiteModal';



export default function SecretariatExameneDashboard() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
const handleLogout = async () => {
    localStorage.removeItem("token");
     await fetch("http://localhost:8000/logout", {
    credentials: "include",
  });
    navigate("/login");
  };

  const handleCardClick = (route) => {
    // Dacă ruta începe cu "http", declanșează download
    if (/^https?:\/\//.test(route)) {
      window.location.href = route;
    } else {
      navigate(route);
    }
  };
const cards = [
  {
     title: 'Configurare Perioade Examen',
     icon: <Settings size={30} />,
     color: 'bg-indigo-600',
     onClick: () => setModalOpen(true),
   },
    {
      title: 'Editare Examene',
      icon: <Pencil size={30} />,  
      color: 'bg-blue-800',
      route: '/secretariat/examene/editare',
    },
    {
      title: 'Situație Examene',
      icon: <List size={30} />,
      color: 'bg-purple-500',
      route: '/secretariat/examene/situatie',
    },
    {
      title: 'Descarcă Examene Excel',
      icon: <Download size={30} />,
      color: 'bg-green-600',
      route: 'http://localhost:8000/secretariat/api/examene/export/excel',
    },
    {
      title: 'Descarcă Examene PDF',
      icon: <Download size={30} />,
      color: 'bg-green-600',
      route: 'http://localhost:8000/secretariat/api/examene/export/pdf',
    },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-r from-green-100 to-cyan-100 relative flex flex-col items-center p-10">
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-50 flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"
      >
        <LogOut className="mr-2" size={18} /> Deconectare
      </button>
    <div className="max-w-5xl mx-auto bg-white w-full rounded-lg shadow p-6">
      <button
        onClick={() => window.history.back()}
        className="mb-4 flex items-center text-gray-700 hover:text-gray-900"
      >
        <ArrowLeft className="mr-2" size={20} /> Înapoi
      </button>
      <h1 className="text-4xl font-bold text-center mb-6">Gestionare Examene</h1>


      <div className="flex justify-center mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {cards.map((card) => (
              <div
                key={card.title}
    onClick={() => {
      if (card.onClick) {
        card.onClick();
      } else {
        handleCardClick(card.route);
      }
    }}
                className={`${card.color} cursor-pointer rounded-3xl shadow-lg p-4 text-white flex flex-col items-center hover:scale-110 transition-transform`}
              >
                {card.icon}
                <h2 className="text-2xl font-semibold text-center mt-4">
                  {card.title}
                </h2>
              </div>
            ))}
          </div>
          
    <ExamenLimiteModal
       isOpen={modalOpen}
       onRequestClose={() => setModalOpen(false)}
     />
        </div>
    </div>
    </div>
  );
}
