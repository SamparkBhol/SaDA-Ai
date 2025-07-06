import React, { useState, useEffect, useRef, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import { useGSAP } from '@gsap/react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Text3D, Environment, Float, Box, Torus } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import './App.css';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin, useGSAP);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// 3D Scene Components with new color scheme
const FloatingOrb = ({ position, color, scale = 1 }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.3;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
      <Sphere ref={meshRef} position={position} scale={scale} args={[1, 32, 32]}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.1}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
};

const AI_Brain = () => {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <Torus position={[0, 0, 0]} args={[2, 0.1, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#06b6d4" metalness={0.8} roughness={0.2} />
      </Torus>
      <Torus position={[0, 0, 0]} args={[1.5, 0.1, 16, 100]} rotation={[0, Math.PI / 2, 0]}>
        <meshStandardMaterial color="#22d3ee" metalness={0.8} roughness={0.2} />
      </Torus>
      <Torus position={[0, 0, 0]} args={[1, 0.1, 16, 100]} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <meshStandardMaterial color="#ec4899" metalness={0.8} roughness={0.2} />
      </Torus>
      <Sphere position={[0, 0, 0]} args={[0.5, 32, 32]}>
        <MeshDistortMaterial
          color="#f97316"
          distort={0.6}
          speed={3}
          metalness={1}
          roughness={0}
        />
      </Sphere>
    </group>
  );
};

const BackgroundScene = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      style={{ position: 'absolute', top: 0, left: 0, zIndex: -1 }}
    >
      <Suspense fallback={null}>
        <Environment preset="night" />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />
        
        <FloatingOrb position={[-4, 2, -2]} color="#06b6d4" scale={0.8} />
        <FloatingOrb position={[4, -2, -3]} color="#22d3ee" scale={0.6} />
        <FloatingOrb position={[2, 3, -4]} color="#ec4899" scale={0.4} />
        <FloatingOrb position={[-3, -1, -1]} color="#f97316" scale={0.3} />
        
        <AI_Brain />
        
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Suspense>
    </Canvas>
  );
};

// Advanced Animated Navigation with new colors
const Navigation = ({ currentView, setCurrentView }) => {
  const navRef = useRef(null);
  const logoRef = useRef(null);
  
  useGSAP(() => {
    gsap.fromTo(navRef.current, 
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    );
    
    gsap.fromTo(logoRef.current,
      { scale: 0, rotation: 180 },
      { scale: 1, rotation: 0, duration: 1.2, ease: "elastic.out(1, 0.3)", delay: 0.3 }
    );
  }, []);
  
  return (
    <nav ref={navRef} className="bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 nav-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div 
            ref={logoRef}
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-lg mr-3 flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
              SaDA AI - Smarter Documents. Smarter Support. Instantly
            </h1>
          </motion.div>
          <div className="flex space-x-2">
            {[
              { key: 'home', label: 'Home', icon: '🏠' },
              { key: 'document', label: 'Document Analysis', icon: '📄' },
              { key: 'support', label: 'Customer Support', icon: '🎧' }
            ].map((tab, index) => (
              <motion.button
                key={tab.key}
                onClick={() => setCurrentView(tab.key)}
                className={`relative px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  currentView === tab.key
                    ? 'bg-gradient-to-r from-cyan-600 to-pink-600 text-white shadow-lg'
                    : 'text-cyan-100 hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
                {currentView === tab.key && (
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white/50 rounded-full"
                    layoutId="activeTab"
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Enhanced Hero Section with new color scheme
const HeroSection = () => {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const descriptionRef = useRef(null);
  const buttonsRef = useRef(null);
  
  useGSAP(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(titleRef.current, 
      { scale: 0, rotation: 10, opacity: 0 },
      { scale: 1, rotation: 0, opacity: 1, duration: 1.5, ease: "elastic.out(1, 0.3)" }
    )
    .fromTo(subtitleRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
      "-=1"
    )
    .fromTo(descriptionRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
      "-=0.5"
    )
    .fromTo(buttonsRef.current.children,
      { scale: 0, rotation: 180 },
      { scale: 1, rotation: 0, duration: 0.8, ease: "back.out(1.7)", stagger: 0.2 },
      "-=0.3"
    );

    // Continuous floating animation for title
    gsap.to(titleRef.current, {
      y: -10,
      duration: 3,
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1
    });
  }, []);
  
  const handleButtonHover = (e) => {
    gsap.to(e.target, {
      scale: 1.1,
      boxShadow: "0 20px 40px rgba(6, 182, 212, 0.4)",
      duration: 0.3,
      ease: "power2.out"
    });
  };
  
  const handleButtonLeave = (e) => {
    gsap.to(e.target, {
      scale: 1,
      boxShadow: "0 10px 25px rgba(6, 182, 212, 0.2)",
      duration: 0.3,
      ease: "power2.out"
    });
  };
  
  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <BackgroundScene />
      
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-pink-900/30 to-orange-800/20"></div>
      
      <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
        <motion.h1 
          ref={titleRef}
          className="text-7xl md:text-9xl font-black text-white mb-8 hero-title"
          style={{ 
            background: 'linear-gradient(45deg, #22d3ee, #ec4899, #f97316)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 20px rgba(34, 211, 238, 0.3))'
          }}
        >
          SaDA AI
        </motion.h1>
        
        <motion.div ref={subtitleRef} className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-cyan-100 mb-4">
            Smart Document Analysis & Customer Support
          </h2>
          <div className="w-32 h-1 bg-gradient-to-r from-cyan-500 to-pink-500 mx-auto rounded-full"></div>
        </motion.div>
        
        <motion.p 
          ref={descriptionRef}
          className="text-xl md:text-2xl text-cyan-200 mb-12 max-w-4xl mx-auto leading-relaxed"
        >
          Revolutionize how your team understands documents and supports customers. SaDA AI is a next-generation platform that combines advanced document intelligence with multimodal AI-powered customer support — all in one elegant, animated interface. Upload documents, ask questions, and receive instant insights with the power of cutting-edge LLMs and real-time media understanding.
          Built for speed. Designed for scale. Ready for production.
        </motion.p>
        
        <motion.div 
          ref={buttonsRef}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <button 
            className="group relative px-12 py-4 bg-gradient-to-r from-cyan-600 to-pink-600 text-white text-lg font-bold rounded-2xl shadow-lg transition-all duration-300 hero-button"
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            <span className="relative z-10">🚀 Analyze Documents</span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-700 to-pink-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          
          <button 
            className="group relative px-12 py-4 bg-gradient-to-r from-pink-600 to-orange-600 text-white text-lg font-bold rounded-2xl shadow-lg transition-all duration-300 hero-button"
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            <span className="relative z-10">💬 Customer Support</span>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-700 to-orange-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </motion.div>
        
        {/* Floating Stats */}
        <motion.div 
          className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 1 }}
        >
          {[
            { number: "99%", label: "Accuracy" },
            { number: "10x", label: "Faster" },
            { number: "24/7", label: "Available" }
          ].map((stat, index) => (
            <motion.div 
              key={index}
              className="text-center"
              whileHover={{ scale: 1.1, y: -5 }}
            >
              <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
              <div className="text-cyan-300 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Enhanced Features Section with new colors
const FeaturesSection = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef(null);
  
  useGSAP(() => {
    const cards = cardsRef.current.children;
    
    gsap.fromTo(titleRef.current,
      { opacity: 0, y: 50, scale: 0.8 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      }
    );
    
    gsap.fromTo(cards,
      { opacity: 0, y: 100, rotationX: 45 },
      {
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.2,
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 70%",
          toggleActions: "play none none reverse"
        }
      }
    );
  }, []);
  
  const features = [
    {
      title: "AI Document Analysis",
      description: "Advanced LLM-powered analysis of contracts, research papers, and reports with real-time insights",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
      icon: "📊",
      gradient: "from-cyan-500 to-blue-500"
    },
    {
      title: "Multimodal Support",
      description: "Process text, images, audio, and video for comprehensive customer support automation",
      image: "https://images.unsplash.com/photo-1709715357479-591f9971fb05",
      icon: "🎯",
      gradient: "from-pink-500 to-rose-500"
    },
    {
      title: "3D AI Visualization",
      description: "Interactive 3D visualizations powered by Three.js for immersive data exploration",
      image: "https://images.unsplash.com/photo-1557562645-4eee56b29bc1",
      icon: "🌐",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      title: "Real-time Processing",
      description: "Lightning-fast document processing and instant AI responses with advanced algorithms",
      image: "https://images.unsplash.com/photo-1666875753105-c63a6f3bdc86",
      icon: "⚡",
      gradient: "from-orange-500 to-amber-500"
    }
  ];
  
  return (
    <section ref={sectionRef} className="py-24 bg-gradient-to-br from-gray-50 to-cyan-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -right-10 w-60 h-60 bg-pink-400/10 rounded-full blur-3xl animate-pulse"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div ref={titleRef} className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-cyan-600 to-pink-600 bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience cutting-edge AI technology with advanced animations and 3D interactions
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-pink-500 mx-auto mt-6 rounded-full"></div>
        </div>
        
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 feature-card"
              whileHover={{ 
                scale: 1.05, 
                rotateY: 5,
                z: 50
              }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative h-56 overflow-hidden">
                <img src={feature.image} alt={feature.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className={`absolute inset-0 bg-gradient-to-t ${feature.gradient} opacity-80`}></div>
                <div className="absolute top-4 left-4 text-4xl group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-white rounded-full"
                      initial={{ width: "0%" }}
                      whileInView={{ width: "100%" }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-cyan-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/0 to-pink-600/0 group-hover:from-cyan-600/10 group-hover:to-pink-600/10 transition-all duration-500 pointer-events-none"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Enhanced Document Analysis with new colors
const DocumentAnalysis = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysisType, setAnalysisType] = useState('summary');
  const containerRef = useRef(null);
  const sidebarRef = useRef(null);
  const mainRef = useRef(null);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    onDrop: handleFileUpload
  });
  
  useGSAP(() => {
    gsap.fromTo(sidebarRef.current,
      { x: -100, opacity: 0 },
      { x: 0, opacity: 1, duration: 1, ease: "power3.out" }
    );
    
    gsap.fromTo(mainRef.current,
      { x: 100, opacity: 0 },
      { x: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.2 }
    );
  }, []);
  
  useEffect(() => {
    loadSessions();
  }, []);
  
  useEffect(() => {
    if (currentSession) {
      loadAnalyses(currentSession.id);
    }
  }, [currentSession]);
  
  const loadSessions = async () => {
    try {
      const response = await axios.get(`${API}/chat/sessions`);
      const docSessions = response.data.filter(s => s.session_type === 'document_analysis');
      setSessions(docSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };
  
  const loadAnalyses = async (sessionId) => {
    try {
      const response = await axios.get(`${API}/documents/analyses/${sessionId}`);
      setAnalyses(response.data);
    } catch (error) {
      console.error('Error loading analyses:', error);
    }
  };
  
  const createNewSession = async () => {
    try {
      const response = await axios.post(`${API}/chat/sessions`, {
        session_name: `Document Analysis ${new Date().toLocaleString()}`,
        session_type: 'document_analysis'
      });
      setCurrentSession(response.data);
      loadSessions();
      
      // Animate new session creation
      gsap.fromTo(".session-item:first-child",
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
      );
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };
  
  async function handleFileUpload(acceptedFiles) {
    if (!currentSession) {
      await createNewSession();
    }
    
    const file = acceptedFiles[0];
    if (!file) return;
    
    setLoading(true);
    
    // Animate loading state
    gsap.to(".upload-area", {
      scale: 1.05,
      duration: 0.3,
      yoyo: true,
      repeat: 1
    });
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Content = e.target.result.split(',')[1];
        
        const analysisResponse = await axios.post(`${API}/documents/analyze`, {
          filename: file.name,
          content_type: file.type,
          file_size: file.size,
          analysis_type: analysisType,
          file_content: base64Content,
          session_id: currentSession.id
        });
        
        setAnalyses(prev => [analysisResponse.data, ...prev]);
        setLoading(false);
        
        // Animate new analysis result
        gsap.fromTo(".analysis-result:first-child",
          { y: 50, opacity: 0, scale: 0.9 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "power3.out" }
        );
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error analyzing document:', error);
      setLoading(false);
    }
  }
  
  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-cyan-50 via-pink-50 to-orange-50 py-8 relative overflow-hidden">
      {/* Animated background elements */}
      <Canvas
        style={{ position: 'fixed', top: 0, left: 0, zIndex: 0 }}
        camera={{ position: [0, 0, 5] }}
      >
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} intensity={0.3} />
        <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
          <Box position={[-3, 2, -5]} scale={0.3}>
            <meshStandardMaterial color="#06b6d4" wireframe />
          </Box>
        </Float>
        <Float speed={2} rotationIntensity={0.3} floatIntensity={0.8}>
          <Torus position={[3, -2, -3]} scale={0.2}>
            <meshStandardMaterial color="#22d3ee" />
          </Torus>
        </Float>
      </Canvas>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-5xl font-black bg-gradient-to-r from-cyan-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Document Analysis Lab
          </h2>
          <p className="text-xl text-gray-600">Advanced AI-powered document processing with real-time insights</p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Session Sidebar */}
          <motion.div 
            ref={sidebarRef}
            className="lg:col-span-1"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Sessions</h3>
                <motion.button
                  onClick={createNewSession}
                  className="bg-gradient-to-r from-cyan-600 to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg"
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(6, 182, 212, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  + New Session
                </motion.button>
              </div>
              <div className="space-y-3">
                {sessions.map((session, index) => (
                  <motion.button
                    key={session.id}
                    onClick={() => setCurrentSession(session)}
                    className={`session-item w-full text-left p-4 rounded-xl transition-all duration-300 ${
                      currentSession?.id === session.id
                        ? 'bg-gradient-to-r from-cyan-500 to-pink-500 text-white shadow-lg'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                    }`}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="font-medium text-sm mb-1">{session.session_name}</div>
                    <div className="text-xs opacity-75">{new Date(session.created_at).toLocaleDateString()}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
          
          {/* Enhanced Main Content */}
          <div ref={mainRef} className="lg:col-span-3">
            {/* Analysis Type Selector */}
            <motion.div 
              className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 mb-8 border border-white/20"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Analysis Type</h3>
              <div className="flex flex-wrap gap-3">
                {['summary', 'insights', 'entities', 'sentiment'].map((type, index) => (
                  <motion.button
                    key={type}
                    onClick={() => setAnalysisType(type)}
                    className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      analysisType === type
                        ? 'bg-gradient-to-r from-cyan-600 to-pink-600 text-white shadow-lg'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </motion.button>
                ))}
              </div>
            </motion.div>
            
            {/* Enhanced File Upload Area */}
            <motion.div 
              className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 mb-8 border border-white/20"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div
                {...getRootProps()}
                className={`upload-area border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-500 ${
                  isDragActive 
                    ? 'border-cyan-500 bg-cyan-50 scale-105' 
                    : 'border-gray-300 hover:border-cyan-400 hover:bg-cyan-50/50'
                }`}
              >
                <input {...getInputProps()} />
                <motion.div 
                  className="text-6xl mb-6"
                  animate={{ 
                    rotateY: isDragActive ? 180 : 0,
                    scale: isDragActive ? 1.2 : 1
                  }}
                  transition={{ duration: 0.3 }}
                >
                  📁
                </motion.div>
                <motion.p 
                  className="text-xl font-semibold text-gray-700 mb-4"
                  animate={{ color: isDragActive ? "#0891b2" : "#374151" }}
                >
                  {isDragActive ? 'Drop your files here!' : 'Drag & drop files or click to upload'}
                </motion.p>
                <p className="text-gray-500">
                  Supports PDF, TXT, CSV, DOCX files • Advanced AI analysis ready
                </p>
              </div>
            </motion.div>
            
            {/* Enhanced Loading State */}
            <AnimatePresence>
              {loading && (
                <motion.div 
                  className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 mb-8 border border-white/20"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <div className="flex items-center justify-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-cyan-200 rounded-full"></div>
                      <div className="absolute top-0 left-0 w-12 h-12 border-4 border-cyan-600 rounded-full animate-spin border-t-transparent"></div>
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-gray-800">Analyzing document...</p>
                      <p className="text-gray-600">AI is processing your file with advanced algorithms</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Enhanced Analysis Results */}
            <div className="space-y-8">
              <AnimatePresence>
                {analyses.map((analysis, index) => (
                  <motion.div
                    key={analysis.id}
                    className="analysis-result bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20"
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -50, scale: 0.9 }}
                    whileHover={{ scale: 1.02, boxShadow: "0 25px 50px rgba(0,0,0,0.1)" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <motion.div 
                          className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-xl"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          📄
                        </motion.div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{analysis.filename}</h3>
                          <p className="text-gray-600">{analysis.analysis_type} • {new Date(analysis.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
                            Summary
                          </h4>
                          <div className="bg-gradient-to-r from-cyan-50 to-pink-50 p-4 rounded-xl border-l-4 border-cyan-500">
                            <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
                          </div>
                        </div>
                        
                        {analysis.sentiment_score !== null && (
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                              Sentiment Analysis
                            </h4>
                            <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 p-4 rounded-xl">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Sentiment Score</span>
                                <span className="font-semibold">{analysis.sentiment_score.toFixed(2)}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <motion.div 
                                  className={`h-full rounded-full ${
                                    analysis.sentiment_score > 0 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-red-500 to-pink-500'
                                  }`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.abs(analysis.sentiment_score) * 100}%` }}
                                  transition={{ duration: 1, delay: 0.5 }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        {analysis.key_insights.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                              <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
                              Key Insights
                            </h4>
                            <div className="space-y-3">
                              {analysis.key_insights.map((insight, i) => (
                                <motion.div
                                  key={i}
                                  className="bg-gradient-to-r from-pink-50 to-orange-50 p-3 rounded-xl border-l-4 border-pink-500"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.7 + i * 0.1 }}
                                  whileHover={{ scale: 1.02, x: 5 }}
                                >
                                  <p className="text-gray-700 text-sm leading-relaxed">
                                    <span className="font-semibold text-pink-600 mr-2">•</span>
                                    {insight}
                                  </p>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Customer Support with new colors
const CustomerSupport = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'audio/*': ['.mp3', '.wav', '.m4a'],
      'video/*': ['.mp4', '.mov', '.avi'],
      'text/*': ['.txt']
    },
    onDrop: handleFileAttachment,
    noClick: true
  });
  
  useGSAP(() => {
    gsap.fromTo(chatRef.current,
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1, ease: "power3.out" }
    );
  }, []);
  
  useEffect(() => {
    loadSessions();
  }, []);
  
  useEffect(() => {
    if (currentSession) {
      loadMessages(currentSession.id);
    }
  }, [currentSession]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const loadSessions = async () => {
    try {
      const response = await axios.get(`${API}/chat/sessions`);
      const supportSessions = response.data.filter(s => s.session_type === 'customer_support');
      setSessions(supportSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };
  
  const loadMessages = async (sessionId) => {
    try {
      const response = await axios.get(`${API}/chat/messages/${sessionId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };
  
  const createNewSession = async () => {
    try {
      const response = await axios.post(`${API}/chat/sessions`, {
        session_name: `Support Chat ${new Date().toLocaleString()}`,
        session_type: 'customer_support'
      });
      setCurrentSession(response.data);
      loadSessions();
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };
  
  function handleFileAttachment(acceptedFiles) {
    const file = acceptedFiles[0];
    if (file) {
      setAttachedFile(file);
      // Animate file attachment
      gsap.fromTo(".file-attachment",
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
      );
    }
  }
  
  const removeAttachment = () => {
    gsap.to(".file-attachment", {
      scale: 0,
      opacity: 0,
      duration: 0.3,
      onComplete: () => setAttachedFile(null)
    });
  };
  
  const sendMessage = async () => {
    if (!inputMessage.trim() && !attachedFile) return;
    if (!currentSession) {
      await createNewSession();
    }
    
    setLoading(true);
    
    // Animate message sending
    gsap.to(".message-input", {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1
    });
    
    try {
      let fileContent = null;
      let fileType = null;
      
      if (attachedFile) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          fileContent = e.target.result.split(',')[1];
          fileType = attachedFile.type;
          await sendMessageToAPI(fileContent, fileType);
        };
        reader.readAsDataURL(attachedFile);
      } else {
        await sendMessageToAPI(null, null);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setLoading(false);
    }
  };
  
  const sendMessageToAPI = async (fileContent, fileType) => {
    try {
      const response = await axios.post(`${API}/chat/message`, {
        session_id: currentSession.id,
        user_message: inputMessage,
        message_type: fileType ? fileType.split('/')[0] : 'text',
        file_content: fileContent,
        file_type: fileType
      });
      
      setMessages(prev => [...prev, response.data]);
      setInputMessage('');
      setAttachedFile(null);
      setLoading(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setLoading(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-cyan-50 to-orange-50 py-8 relative overflow-hidden">
      {/* 3D Background */}
      <Canvas
        style={{ position: 'fixed', top: 0, left: 0, zIndex: 0 }}
        camera={{ position: [0, 0, 8] }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <Float speed={0.5} rotationIntensity={0.2} floatIntensity={0.3}>
          <Torus position={[-4, 2, -3]} args={[1, 0.3, 16, 100]} rotation={[0, 0, Math.PI / 4]}>
            <meshStandardMaterial color="#ec4899" metalness={0.8} roughness={0.2} />
          </Torus>
        </Float>
        <Float speed={1} rotationIntensity={0.3} floatIntensity={0.5}>
          <Box position={[4, -2, -2]} scale={0.5}>
            <meshStandardMaterial color="#22d3ee" wireframe />
          </Box>
        </Float>
      </Canvas>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-5xl font-black bg-gradient-to-r from-pink-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            AI Customer Support
          </h2>
          <p className="text-xl text-gray-600">Multimodal AI assistant with advanced 3D interactions</p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Session Sidebar */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Chat Sessions</h3>
                <motion.button
                  onClick={createNewSession}
                  className="bg-gradient-to-r from-pink-600 to-cyan-600 text-white px-4 py-2 rounded-xl text-sm font-semibold"
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(236, 72, 153, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  + New Chat
                </motion.button>
              </div>
              <div className="space-y-3">
                {sessions.map((session, index) => (
                  <motion.button
                    key={session.id}
                    onClick={() => setCurrentSession(session)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                      currentSession?.id === session.id
                        ? 'bg-gradient-to-r from-pink-500 to-cyan-500 text-white shadow-lg'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                    }`}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="font-medium text-sm mb-1">{session.session_name}</div>
                    <div className="text-xs opacity-75">{new Date(session.created_at).toLocaleDateString()}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
          
          {/* Enhanced Chat Interface */}
          <div ref={chatRef} className="lg:col-span-3">
            <motion.div 
              className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col h-[600px] border border-white/20"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {/* Enhanced Chat Header */}
              <div className="px-8 py-6 bg-gradient-to-r from-pink-600 via-cyan-600 to-orange-600 text-white rounded-t-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-1">
                    {currentSession ? currentSession.session_name : 'Select or create a session'}
                  </h3>
                  <p className="text-pink-100 text-sm">Powered by advanced AI • Multimodal support</p>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
              </div>
              
              {/* Enhanced Messages Area */}
              <div 
                {...getRootProps()} 
                className={`flex-1 overflow-y-auto p-6 space-y-4 ${isDragActive ? 'bg-pink-50 border-2 border-dashed border-pink-300' : ''}`}
              >
                <input {...getInputProps()} />
                {isDragActive && (
                  <motion.div 
                    className="absolute inset-0 bg-pink-100/80 backdrop-blur-sm flex items-center justify-center z-20 rounded-2xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="text-center">
                      <div className="text-6xl mb-4">📎</div>
                      <p className="text-xl font-semibold text-pink-800">Drop your files here!</p>
                    </div>
                  </motion.div>
                )}
                
                {messages.map((message, index) => (
                  <div key={message.id} className="space-y-3">
                    {/* User Message */}
                    <motion.div 
                      className="flex justify-end"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="bg-gradient-to-r from-pink-600 to-cyan-600 text-white rounded-2xl rounded-br-sm px-6 py-3 max-w-md shadow-lg">
                        <p className="leading-relaxed">{message.user_message}</p>
                        {message.file_content && (
                          <motion.div 
                            className="mt-3 p-3 bg-white/20 rounded-xl backdrop-blur-sm"
                            whileHover={{ scale: 1.02 }}
                          >
                            <p className="text-sm">📎 {message.file_type}</p>
                          </motion.div>
                        )}
                        <p className="text-xs text-pink-100 mt-2 opacity-75">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </motion.div>
                    
                    {/* AI Response */}
                    <motion.div
                      className="flex justify-start"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    >
                      <div className="flex items-start space-x-3">
                        <motion.div 
                          className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          AI
                        </motion.div>
                        <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm px-6 py-3 max-w-md shadow-lg">
                          <p className="leading-relaxed whitespace-pre-wrap">{message.ai_response}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            SaDA AI • {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                ))}
                
                {/* Enhanced Loading State */}
                <AnimatePresence>
                  {loading && (
                    <motion.div 
                      className="flex justify-start"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-full flex items-center justify-center">
                          <motion.div
                            className="w-2 h-2 bg-white rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                          />
                        </div>
                        <div className="bg-gray-100 text-gray-800 rounded-2xl px-6 py-3">
                          <div className="flex items-center space-x-2">
                            <motion.div 
                              className="flex space-x-1"
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                              <div className="w-2 h-2 bg-pink-600 rounded-full"></div>
                              <div className="w-2 h-2 bg-pink-600 rounded-full"></div>
                              <div className="w-2 h-2 bg-pink-600 rounded-full"></div>
                            </motion.div>
                            <span className="text-sm">SaDA AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Enhanced Input Area */}
              <div className="p-6 bg-gray-50/80 backdrop-blur-sm rounded-b-2xl border-t border-gray-200/50">
                <AnimatePresence>
                  {attachedFile && (
                    <motion.div 
                      className="file-attachment mb-4 p-3 bg-pink-100 rounded-xl flex items-center justify-between"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center text-white text-sm">
                          📎
                        </div>
                        <div>
                          <p className="font-medium text-pink-800">{attachedFile.name}</p>
                          <p className="text-xs text-pink-600">{(attachedFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <motion.button
                        onClick={removeAttachment}
                        className="text-red-500 hover:text-red-700 font-bold text-lg"
                        whileHover={{ scale: 1.2, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        ✕
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="flex items-end space-x-4">
                  <div className="flex-1">
                    <motion.input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message... (or drag & drop files)"
                      className="message-input w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                      disabled={loading}
                      whileFocus={{ scale: 1.02 }}
                    />
                  </div>
                  <motion.button
                    onClick={sendMessage}
                    disabled={loading || (!inputMessage.trim() && !attachedFile)}
                    className="bg-gradient-to-r from-pink-600 to-cyan-600 hover:from-pink-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg"
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(236, 72, 153, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Send 🚀
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component with Enhanced Routing
const App = () => {
  const [currentView, setCurrentView] = useState('home');
  
  const renderView = () => {
    switch (currentView) {
      case 'document':
        return <DocumentAnalysis />;
      case 'support':
        return <CustomerSupport />;
      default:
        return (
          <div className="min-h-screen relative overflow-hidden">
            <HeroSection />
            <FeaturesSection />
          </div>
        );
    }
  };
  
  return (
    <div className="App relative">
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-pink-900 to-orange-800">
          <Navigation currentView={currentView} setCurrentView={setCurrentView} />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Routes>
                <Route path="/" element={renderView()} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </BrowserRouter>
    </div>
  );
};

export default App;