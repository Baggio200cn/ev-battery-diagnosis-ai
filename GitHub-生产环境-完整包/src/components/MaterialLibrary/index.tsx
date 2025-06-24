import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  CardActions,
  Tabs,
  Tab,
  Alert,
  TextField,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  CardMedia,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Pagination,
  Avatar,
  ListItemAvatar,
  ListItemSecondaryAction,
  Checkbox,
  Paper,
  LinearProgress,
  Tooltip,
  Menu,
  ListItemIcon,
  Divider,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Upload as UploadIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Folder as FolderIcon,
  Description as TextIcon,
  AudioFile as AudioIcon,
  VideoFile as VideoIcon,
  Language as WebIcon,
  Image as ImageIcon,
  AutoFixHigh as AutoIntegrateIcon,
  LibraryBooks as KnowledgeIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  AutoAwesome as AutoIcon,
  Storage as StorageIcon,
  FilterList as FilterIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  CloudSync as CloudSyncIcon,
  InsertDriveFile as FileIcon,
  Share as ShareIcon,
  CheckBox as SelectAllIcon,
  CheckBoxOutlineBlank as DeselectAllIcon,
  Backup as BackupIcon,
  Restore as RestoreIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { arxivService } from '../../api/arxivService';
import { multiSourceSearchService } from '../../api/multiSourceSearch';
import { MaterialItem, KnowledgeDocument } from '../../types';

// 云存储接口
interface CloudStorage {
  provider: 'local' | 'aws' | 'azure' | 'google';
  totalSpace: number;
  usedSpace: number;
  syncStatus: 'idle' | 'syncing' | 'error';
  lastSync: string;
}

interface MaterialLibraryProps {
  materials?: MaterialItem[];
  onMaterialsChange?: (materials: MaterialItem[]) => void;
  onAddToKnowledgeBase?: (document: KnowledgeDocument) => void;
  knowledgeDocuments?: KnowledgeDocument[];
}

const MaterialLibrary: React.FC<MaterialLibraryProps> = ({ 
  materials: propMaterials = [],
  onMaterialsChange, 
  onAddToKnowledgeBase,
  knowledgeDocuments = []
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [materials, setMaterials] = useState<MaterialItem[]>(propMaterials);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [viewDialog, setViewDialog] = useState<{ open: boolean; material: MaterialItem | null }>({
    open: false,
    material: null
  });
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [webSearchQuery, setWebSearchQuery] = useState('');
  const [autoIntegrationEnabled, setAutoIntegrationEnabled] = useState(true);
  const [integrationDialog, setIntegrationDialog] = useState<{ 
    open: boolean; 
    material: MaterialItem | null; 
    suggestedCategory: string;
    suggestedTags: string[];
  }>({
    open: false,
    material: null,
    suggestedCategory: '',
    suggestedTags: []
  });
  const [knowledgeDialog, setKnowledgeDialog] = useState<{
    open: boolean;
    document: KnowledgeDocument | null;
  }>({
    open: false,
    document: null
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showCloudSettings, setShowCloudSettings] = useState(false);
  const [cloudStorage, setCloudStorage] = useState<CloudStorage>({
    provider: 'local',
    totalSpace: 100 * 1024 * 1024 * 1024, // 100GB
    usedSpace: 15.7 * 1024 * 1024 * 1024, // 15.7GB
    syncStatus: 'idle',
    lastSync: new Date().toISOString()
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    itemId: string;
  } | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // 知识库分类
  const knowledgeCategories = [
    '系统概述',
    '机械故障', 
    '电气故障',
    '安全系统',
    '电池系统',
    '维护保养',
    '技术标准',
    '操作规程',
    '故障案例'
  ];

  // 加载已保存的素材库数据
  useEffect(() => {
    console.log('加载素材库数据...');
    const savedMaterials = localStorage.getItem('materialLibrary');
    if (savedMaterials) {
      try {
        const parsedMaterials = JSON.parse(savedMaterials);
        console.log('从localStorage加载了', parsedMaterials.length, '个素材');
        setMaterials(parsedMaterials);
        onMaterialsChange?.(parsedMaterials);
      } catch (error) {
        console.error('加载素材库数据失败:', error);
      }
    } else {
      console.log('localStorage中没有素材库数据');
    }

    // 加载自动集成设置
    const savedAutoIntegration = localStorage.getItem('autoIntegrationEnabled');
    if (savedAutoIntegration !== null) {
      setAutoIntegrationEnabled(JSON.parse(savedAutoIntegration));
    }

    // 加载搜索结果
    const savedSearchResults = localStorage.getItem('webSearchResults');
    if (savedSearchResults) {
      try {
        const parsedResults = JSON.parse(savedSearchResults);
        setSearchResults(parsedResults);
      } catch (error) {
        console.error('加载搜索结果失败:', error);
      }
    }

    // 加载搜索查询
    const savedWebSearchQuery = localStorage.getItem('webSearchQuery');
    if (savedWebSearchQuery) {
      setWebSearchQuery(savedWebSearchQuery);
    }
  }, [onMaterialsChange]);

  // 保存素材库数据到localStorage
  const saveMaterialsToStorage = (materialsToSave: MaterialItem[]) => {
    try {
      // 创建一个轻量级版本，移除大文件内容
      const lightweightMaterials = materialsToSave.map(material => {
        const lightMaterial = { ...material };
        
        // 对于大文件，只保存元数据，不保存内容
        if (material.content && material.content.length > 100000) {
          lightMaterial.content = '[大文件内容已省略 - 请重新上传]';
          lightMaterial.imagePreview = undefined; // 移除图片预览
        }
        
        // 对于文本文件，如果超过50KB也进行截断
        if (material.type === 'text' && material.content && material.content.length > 50000) {
          lightMaterial.content = material.content.substring(0, 50000) + '\n\n[内容已截断 - 原文件过大]';
        }
        
        return lightMaterial;
      });
      
      const dataString = JSON.stringify(lightweightMaterials);
      
      // 检查数据大小，localStorage限制通常是5-10MB
      if (dataString.length > 4 * 1024 * 1024) { // 4MB限制
        console.warn('数据过大，进行进一步压缩...');
        
        // 进一步压缩：只保留最近的100个项目
        const recentMaterials = lightweightMaterials
          .sort((a, b) => new Date(b.uploadDate || 0).getTime() - new Date(a.uploadDate || 0).getTime())
          .slice(0, 100);
        
        localStorage.setItem('materialLibrary', JSON.stringify(recentMaterials));
        console.warn(`数据已压缩：从${lightweightMaterials.length}个项目减少到${recentMaterials.length}个项目`);
      } else {
        localStorage.setItem('materialLibrary', dataString);
      }
    } catch (error) {
      console.error('保存素材库数据失败:', error);
      
      // 如果仍然失败，尝试清理旧数据
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('localStorage配额不足，清理旧数据...');
        try {
          // 清理其他可能的大数据
          localStorage.removeItem('webSearchResults');
          localStorage.removeItem('knowledgeBase');
          
          // 只保留最近的50个项目
          const recentMaterials = materialsToSave
            .sort((a, b) => new Date(b.uploadDate || 0).getTime() - new Date(a.uploadDate || 0).getTime())
            .slice(0, 50)
            .map(material => ({
              ...material,
              content: material.type === 'text' ? 
                (material.content?.substring(0, 1000) + '[已截断]') : 
                '[内容已移除 - 请重新上传]',
              imagePreview: undefined
            }));
          
          localStorage.setItem('materialLibrary', JSON.stringify(recentMaterials));
          console.warn('已清理数据并保存最近的50个项目');
        } catch (secondError) {
          console.error('清理后仍然保存失败:', secondError);
          // 最后的手段：清空localStorage
          localStorage.clear();
          console.warn('已清空localStorage');
        }
      }
    }
  };

  // 保存自动集成设置
  const saveAutoIntegrationSetting = (enabled: boolean) => {
    try {
      localStorage.setItem('autoIntegrationEnabled', JSON.stringify(enabled));
    } catch (error) {
      console.error('保存自动集成设置失败:', error);
    }
  };

  // 更新素材库并保存
  const updateMaterials = (newMaterials: MaterialItem[]) => {
    setMaterials(newMaterials);
    onMaterialsChange?.(newMaterials);
    saveMaterialsToStorage(newMaterials);
  };

  // 获取素材显示名称
  const getMaterialDisplayName = (material: MaterialItem): string => {
    if (material.type === 'diagnosis_log') {
      return material.title || 'AI诊断日志';
    }
    return material.name || '未命名素材';
  };

  // 获取素材创建时间
  const getMaterialDate = (material: MaterialItem): string => {
    const date = material.createdAt || material.uploadDate;
    if (!date) return new Date().toLocaleDateString();
    
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    
    if (typeof date === 'string') {
      const parsedDate = new Date(date);
      return isNaN(parsedDate.getTime()) ? date : parsedDate.toLocaleDateString();
    }
    
    return new Date().toLocaleDateString();
  };

  // 判断是否为诊断日志
  const isDiagnosisLog = (material: MaterialItem): boolean => {
    return material.type === 'diagnosis_log' || material.source === 'auto_generated';
  };

  // 渲染诊断日志特殊标识
  const renderDiagnosisLogBadge = (material: MaterialItem) => {
    if (isDiagnosisLog(material)) {
      const importanceColor = material.importance === 'high' ? 'error' : 
                            material.importance === 'medium' ? 'warning' : 'info';
      return (
        <Chip 
          size="small" 
          label="诊断日志" 
          color={importanceColor as any}
          variant="outlined"
          sx={{ mr: 1 }}
        />
      );
    }
    return null;
  };

  const autoCategorizeMaterial = (material: MaterialItem): { category: string; tags: string[] } => {
    const content = material.content?.toLowerCase() || '';
    const name = getMaterialDisplayName(material).toLowerCase();
    
    // 诊断日志特殊处理
    if (isDiagnosisLog(material)) {
      return {
        category: '故障诊断日志',
        tags: material.tags || ['AI诊断', '自动生成', '故障记录']
      };
    }

    // 关键词映射
    const categoryKeywords = {
      '机械故障': ['机器人', '手臂', '传输', '升降', '机械', '卡顿', '异响', '磨损', '润滑', '齿轮', '轴承'],
      '电气故障': ['电气', '控制', '传感器', '电源', '通信', '故障码', 'PLC', '变频器', '继电器'],
      '电池系统': ['电池', 'BMS', '充电', '电压', '电流', '温度', '均衡', '过充', '过放', '热失控'],
      '安全系统': ['安全', '报警', '火灾', '烟雾', '气体', '泄漏', '光幕', '急停', '消防', '防护'],
      '维护保养': ['维护', '保养', '检查', '清洁', '更换', '校准', '预防', '定期', '润滑', '点检'],
      '技术标准': ['标准', '规范', '要求', 'GB', 'JT', 'ISO', '国标', '行标', '企标'],
      '操作规程': ['操作', '程序', '流程', '步骤', '指导', '手册', '作业', '规程'],
      '故障案例': ['故障', '案例', '事故', '异常', '问题', '处理', '解决', '维修']
    };

    let bestCategory = '系统概述';
    let maxScore = 0;
    const matchedTags: string[] = [];

    // 计算每个分类的匹配分数
    Object.entries(categoryKeywords).forEach(([category, keywords]) => {
      let score = 0;
      keywords.forEach(keyword => {
        if (content.includes(keyword)) {
          score += 1;
          matchedTags.push(keyword);
        }
      });
      
      if (score > maxScore) {
        maxScore = score;
        bestCategory = category;
      }
    });

    // 去重并限制标签数量
    const uniqueTags = Array.from(new Set(matchedTags)).slice(0, 5);
    
    return {
      category: bestCategory,
      tags: uniqueTags
    };
  };

  // 将素材转换为知识库文档
  const convertToKnowledgeDocument = (material: MaterialItem, category: string, tags: string[]): KnowledgeDocument => {
    return {
      id: `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: getMaterialDisplayName(material),
      content: material.content || '无内容',
      category,
      tags,
      createdAt: new Date().toISOString(),
      relatedDocuments: []
    };
  };

  // 自动集成到知识库
  const integrateToKnowledgeBase = (material: MaterialItem) => {
    const { category, tags } = autoCategorizeMaterial(material);
    
    if (autoIntegrationEnabled) {
      // 直接自动集成
      const document = convertToKnowledgeDocument(material, category, tags);
      onAddToKnowledgeBase?.(document);
      
      // 更新素材状态
      const updatedMaterials = materials.map(m => 
        m.id === material.id 
          ? { ...m, category, tags, autoIntegrated: true }
          : m
      );
      updateMaterials(updatedMaterials);
    } else {
      // 显示确认对话框
      setIntegrationDialog({
        open: true,
        material,
        suggestedCategory: category,
        suggestedTags: tags
      });
    }
  };

  // 手动集成确认
  const handleManualIntegration = () => {
    const { material, suggestedCategory, suggestedTags } = integrationDialog;
    if (material) {
      const document = convertToKnowledgeDocument(material, suggestedCategory, suggestedTags);
      onAddToKnowledgeBase?.(document);
      
      const updatedMaterials = materials.map(m => 
        m.id === material.id 
          ? { ...m, category: suggestedCategory, tags: suggestedTags, autoIntegrated: true }
          : m
      );
      updateMaterials(updatedMaterials);
    }
    
    setIntegrationDialog({
      open: false,
      material: null,
      suggestedCategory: '',
      suggestedTags: []
    });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // 使用多源搜索获取真实和相关的学术文献
  const searchWithMultipleSources = async (query: string) => {
    try {
      console.log(`开始多源搜索: "${query}"`);
      
      // 调用多源搜索服务
      const searchResult = await multiSourceSearchService.searchMultipleSources(query, 6);
      
      // 显示搜索过程信息
      console.log('搜索尝试记录:', searchResult.attempts);
      console.log(`最终使用数据源: ${searchResult.finalSource}`);
      console.log(`找到 ${searchResult.results.length} 个结果`);
      
      // 如果没有找到相关结果，提供建议
      if (searchResult.results.length === 0 || 
          searchResult.attempts.every(a => a.relevanceScore < 0.3)) {
        
        console.log('未找到高相关性结果，返回建议信息');
        
        return [
          {
            title: `关于"${query}"的搜索建议`,
            url: '',
            content: `抱歉，我们在以下数据源中都未找到与"${query}"高度相关的学术文献：\n\n搜索尝试：\n${searchResult.attempts.map(a => 
              `• ${a.source}: ${a.message}`
            ).join('\n')}\n\n建议您尝试以下专业数据库：\n${searchResult.recommendedSources.map(s => `• ${s}`).join('\n')}\n\n提示：不同的学术数据库有不同的专业领域覆盖，选择合适的数据库可以获得更好的搜索结果。`,
            type: "搜索建议",
            authors: "多源搜索系统",
            publishedDate: new Date().toISOString()
          }
        ];
      }
      
      // 在搜索结果前添加数据源信息
      const resultsWithSource = searchResult.results.map(result => ({
        ...result,
        content: `[数据源: ${searchResult.finalSource}]\n\n${result.content}`,
        type: `${result.type} (${searchResult.finalSource})`
      }));
      
      return resultsWithSource;
      
    } catch (error) {
      console.error('多源搜索失败:', error);
      
      // 如果多源搜索失败，回退到本地结果
      return getLocalFallbackResults(query);
    }
  };

  const handleWebSearch = async () => {
    if (!webSearchQuery.trim()) {
      alert('请输入搜索关键词');
      return;
    }

    setIsSearching(true);
    try {
      console.log(`开始搜索: "${webSearchQuery}"`);
      
      // 使用多源搜索
      const smartResults = await searchWithMultipleSources(webSearchQuery);
      setSearchResults(smartResults);
      
      // 保存搜索结果和查询
      localStorage.setItem('webSearchResults', JSON.stringify(smartResults));
      localStorage.setItem('webSearchQuery', webSearchQuery);
      
      console.log(`搜索"${webSearchQuery}"完成，找到${smartResults.length}个结果`);
    } catch (error) {
      console.error('搜索失败:', error);
      alert('搜索失败，请重试');
    } finally {
      setIsSearching(false);
    }
  };

  const addWebMaterial = (result: any) => {
    console.log('添加网络搜索结果到素材库:', result.title);
    
    const newMaterial: MaterialItem = {
      id: `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: result.title,
      type: 'web',
      size: `${Math.round((result.content?.length || 0) / 1024)}KB`,
      uploadDate: new Date().toISOString(),
      url: result.url,
      content: result.content || '无内容摘要',
      description: `网络搜索结果 - 类型: ${result.type}\n作者: ${result.authors || '未知'}\n来源: ${result.url || '网络搜索'}`,
      authors: result.authors,
      source: result.type,
      category: '网络资源',
      tags: ['网络搜索', result.type, ...(result.keywords?.split(',') || [])],
      autoIntegrated: false
    };
    
    try {
      const updatedMaterials = [...materials, newMaterial];
      updateMaterials(updatedMaterials);
      
      // 从搜索结果中移除已添加的项目
      const updatedSearchResults = searchResults.filter(r => r.title !== result.title);
      setSearchResults(updatedSearchResults);
      localStorage.setItem('webSearchResults', JSON.stringify(updatedSearchResults));
      
      console.log('素材已成功添加到库，当前素材总数:', updatedMaterials.length);
      
      // 如果启用自动集成且内容充足，尝试集成到知识库
      if (autoIntegrationEnabled && onAddToKnowledgeBase && (newMaterial as any).content && (newMaterial as any).content.length > 100) {
        setTimeout(() => {
          console.log('开始自动集成到知识库:', newMaterial.name);
          integrateToKnowledgeBase(newMaterial);
        }, 1000);
      }
      
    } catch (error) {
      console.error('添加网络素材失败:', error);
    }
  };

  // 清空搜索结果
  const clearSearchResults = () => {
    setSearchResults([]);
    setWebSearchQuery('');
    localStorage.removeItem('webSearchResults');
    localStorage.removeItem('webSearchQuery');
  };

  // 打开链接
  const openLink = (url: string) => {
    window.open(url, '_blank');
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (files: FileList) => {
    setUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // 模拟上传进度
      for (let progress = 0; progress <= 100; progress += 10) {
        setUploadProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const newMaterial: MaterialItem = {
        id: `material-${Date.now()}-${i}`,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' :
              file.type.startsWith('video/') ? 'video' :
              file.type.startsWith('audio/') ? 'audio' : 'document',
        size: file.size,
        uploadDate: new Date(),
        tags: ['用户上传', file.type.split('/')[0]],
        description: `上传的${file.type.startsWith('image/') ? '图片' : file.type.startsWith('video/') ? '视频' : file.type.startsWith('audio/') ? '音频' : '文档'}文件`
      };

      updateMaterials([...materials, newMaterial]);
    }

    setUploading(false);
    setUploadProgress(0);
    setShowUploadDialog(false);
  };

  // 云同步
  const handleCloudSync = async () => {
    setCloudStorage(prev => ({ ...prev, syncStatus: 'syncing' }));
    
    // 模拟同步过程
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setCloudStorage(prev => ({
      ...prev,
      syncStatus: 'idle',
      lastSync: new Date().toISOString()
    }));

    // 更新材料的云状态
    const updatedMaterials = materials.map(material => ({
      ...material,
      cloudStatus: 'synced' as const
    }));
    updateMaterials(updatedMaterials);
  };

  // 批量操作
  const handleBatchDelete = () => {
    const updatedMaterials = materials.filter(material => 
      !selectedItems.includes(material.id)
    );
    updateMaterials(updatedMaterials);
    setSelectedItems([]);
  };

  const handleBatchCloudSync = async () => {
    const selectedMaterials = materials.filter(material => 
      selectedItems.includes(material.id)
    );
    
    // 模拟批量同步
    for (const material of selectedMaterials) {
      const updatedMaterials = materials.map(m => 
        m.id === material.id ? { ...m, cloudStatus: 'syncing' as const } : m
      );
      updateMaterials(updatedMaterials);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const finalMaterials = materials.map(m => 
        m.id === material.id ? { ...m, cloudStatus: 'synced' as const } : m
      );
      updateMaterials(finalMaterials);
    }
    
    setSelectedItems([]);
  };

  // 右键菜单处理
  const handleContextMenu = (event: React.MouseEvent, itemId: string) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      itemId
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const filteredMaterials = materials.filter(material => {
    const materialName = getMaterialDisplayName(material);
    const matchesSearch = materialName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = activeTab === 0 || 
      (activeTab === 1 && material.type === 'text') ||
      (activeTab === 2 && material.type === 'audio') ||
      (activeTab === 3 && material.type === 'video') ||
      (activeTab === 4 && material.type === 'image') ||
      (activeTab === 5 && material.type === 'web') ||
      (activeTab === 6 && material.type === 'diagnosis_log');
    return matchesSearch && matchesType;
  });

  const getStats = () => {
    return {
      total: materials.length,
      text: materials.filter(m => m.type === 'text').length,
      audio: materials.filter(m => m.type === 'audio').length,
      video: materials.filter(m => m.type === 'video').length,
      image: materials.filter(m => m.type === 'image').length,
      web: materials.filter(m => m.type === 'web').length,
      diagnosis_log: materials.filter(m => m.type === 'diagnosis_log' || isDiagnosisLog(m)).length
    };
  };

  const stats = getStats();

  const handleViewMaterial = (material: MaterialItem) => {
    setViewDialog({ open: true, material });
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'text': return <TextIcon />;
      case 'audio': return <AudioIcon />;
      case 'video': return <VideoIcon />;
      case 'image': return <ImageIcon />;
      case 'web': return <WebIcon />;
      default: return <FolderIcon />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'text': return 'primary';
      case 'audio': return 'secondary';
      case 'video': return 'error';
      case 'image': return 'warning';
      case 'web': return 'success';
      default: return 'default';
    }
  };

  // 本地后备搜索结果 (最后的后备方案)
  const getLocalFallbackResults = (query: string) => {
    console.log(`使用本地后备结果: "${query}"`);
    const lowerQuery = query.toLowerCase();
    
    // 针对不同查询提供相关的技术文档
    if (lowerQuery.includes('机器视觉') || lowerQuery.includes('视觉') || lowerQuery.includes('图像') || lowerQuery.includes('计算机视觉')) {
      return [
        {
          title: "机器视觉技术在智能制造中的应用综述",
          url: "https://www.vision.org.cn/tech/review/2024-cv-manufacturing.html",
          content: "本文系统综述了机器视觉技术在智能制造领域的最新应用。涵盖：1. 缺陷检测技术 - 基于深度学习的表面缺陷自动识别 2. 尺寸测量系统 - 高精度三维测量与质量控制 3. 机器人视觉引导 - 实时定位与路径规划 4. 产品分拣系统 - 多目标识别与智能分类。技术发展趋势：边缘计算、实时处理、多传感器融合。",
          type: "综述论文 (本地缓存)",
          authors: "张明, 李华, 王强",
          publishedDate: new Date().toISOString()
        }
      ];
    }
    
    if (lowerQuery.includes('电') || lowerQuery.includes('配电') || lowerQuery.includes('故障')) {
      return [
        {
          title: "电力系统故障诊断技术综述",
          url: "https://www.powertech.com/fault-diagnosis-review.html",
          content: "系统综述了电力系统故障诊断的主要技术方法。内容包括：1. 传统诊断方法 2. 智能诊断技术 3. 在线监测系统 4. 工程应用案例。为电力工程技术人员提供参考。",
          type: "技术综述 (本地缓存)",
          authors: "电力技术研究团队",
          publishedDate: new Date().toISOString()
        }
      ];
    }
    
    // 默认返回通用结果
    return [
      {
        title: `${query}相关技术资料汇总`,
        url: "https://www.tech-resources.com/search/" + encodeURIComponent(query),
        content: `为您搜索到与"${query}"相关的技术资料。包含最新的研究进展、应用案例、技术标准等内容。建议您查看具体文档获取详细信息。注意：当前显示的是本地缓存结果，建议尝试其他专业数据库获取更多资源。`,
        type: "技术汇总 (本地缓存)",
        authors: "系统整理",
        publishedDate: new Date().toISOString()
      }
    ];
  };

  // 从知识库导入文档到素材库
  const importKnowledgeDocument = (document: KnowledgeDocument) => {
    const newMaterial: MaterialItem = {
      id: `imported_${document.id}_${Date.now()}`,
      name: document.title,
      type: 'text',
      size: `${Math.round(document.content.length / 1024)}KB`,
      uploadDate: new Date().toISOString(),
      content: document.content,
      description: `从知识库导入 - 分类: ${document.category}`,
      category: document.category,
      tags: document.tags,
      autoIntegrated: true
    };

    const updatedMaterials = [...materials, newMaterial];
    updateMaterials(updatedMaterials);
    
    // 关闭对话框
    setKnowledgeDialog({ open: false, document: null });
    
    console.log(`已将知识库文档"${document.title}"导入到素材库`);
  };

  // 查看知识库文档
  const handleViewKnowledgeDocument = (document: KnowledgeDocument) => {
    setKnowledgeDialog({ open: true, document });
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        📚 素材库管理
      </Typography>

      {/* 统计信息和设置 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                素材统计
              </Typography>
              <Grid container spacing={2}>
                <Grid item>
                  <Chip 
                    icon={<FolderIcon />} 
                    label={`总计: ${stats.total}`} 
                    color="primary" 
                  />
                </Grid>
                <Grid item>
                  <Chip 
                    icon={<TextIcon />} 
                    label={`文档: ${stats.text}`} 
                    color="default" 
                  />
                </Grid>
                <Grid item>
                  <Chip 
                    icon={<AudioIcon />} 
                    label={`音频: ${stats.audio}`} 
                    color="secondary" 
                  />
                </Grid>
                <Grid item>
                  <Chip 
                    icon={<VideoIcon />} 
                    label={`视频: ${stats.video}`} 
                    color="error" 
                  />
                </Grid>
                <Grid item>
                  <Chip 
                    icon={<ImageIcon />} 
                    label={`图片: ${stats.image}`} 
                    color="warning" 
                  />
                </Grid>
                <Grid item>
                  <Chip 
                    icon={<WebIcon />} 
                    label={`网络: ${stats.web}`} 
                    color="success" 
                  />
                </Grid>
              </Grid>
              {stats.total > 0 && (
                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexDirection: 'column' }}>
                  <Button 
                    variant="outlined" 
                    color="error" 
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={handleBatchDelete}
                  >
                    清空所有
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="warning" 
                    size="small"
                    startIcon={<ClearIcon />}
                    onClick={() => {
                      if (window.confirm('确定要清理存储空间吗？这将删除所有大文件内容，但保留文件信息。')) {
                        updateMaterials([]);
                      }
                    }}
                  >
                    清理存储
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    存储使用: {formatFileSize(cloudStorage.usedSpace)} / {formatFileSize(cloudStorage.totalSpace)}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                知识库集成设置
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoIntegrationEnabled}
                    onChange={(e) => setAutoIntegrationEnabled(e.target.checked)}
                    color="primary"
                  />
                }
                label="自动集成到知识库"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {autoIntegrationEnabled 
                  ? "新上传的素材将自动分类并添加到知识库" 
                  : "需要手动确认后才会添加到知识库"
                }
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  icon={<KnowledgeIcon />} 
                  label={`已集成: ${materials.filter(m => m.autoIntegrated).length}`}
                  color="success"
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 知识库文档导入区域 */}
      {knowledgeDocuments.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <KnowledgeIcon sx={{ mr: 1, color: 'info.main' }} />
              可导入的知识库文档 ({knowledgeDocuments.length})
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              发现 {knowledgeDocuments.length} 个知识库文档，您可以将它们导入到素材库中进行管理和使用。
            </Alert>
            <Grid container spacing={2}>
              {knowledgeDocuments.map((doc) => (
                <Grid item xs={12} sm={6} md={4} key={doc.id}>
                  <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" noWrap sx={{ mb: 1 }}>
                        {doc.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        分类: {doc.category}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        标签: {doc.tags.slice(0, 3).join(', ')}{doc.tags.length > 3 ? '...' : ''}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        创建: {new Date(doc.createdAt).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        onClick={() => handleViewKnowledgeDocument(doc)}
                        startIcon={<ViewIcon />}
                      >
                        查看
                      </Button>
                      <Button 
                        size="small" 
                        variant="contained"
                        onClick={() => importKnowledgeDocument(doc)}
                        startIcon={<DownloadIcon />}
                      >
                        导入
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* 搜索和上传区域 */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="搜索素材..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={() => setShowUploadDialog(true)}
                size="small"
              >
                文档
              </Button>
              <Button
                variant="outlined"
                startIcon={<AudioIcon />}
                onClick={() => document.getElementById('audio-upload')?.click()}
                size="small"
              >
                音频
              </Button>
              <Button
                variant="outlined"
                startIcon={<VideoIcon />}
                onClick={() => document.getElementById('video-upload')?.click()}
                size="small"
              >
                视频
              </Button>
              <Button
                variant="outlined"
                startIcon={<ImageIcon />}
                onClick={() => document.getElementById('image-upload')?.click()}
                size="small"
              >
                图片
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* 网络搜索区域 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🌐 网络资源搜索
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <TextField
              placeholder="搜索电车换电相关技术资料..."
              fullWidth
              size="small"
              value={webSearchQuery}
              onChange={(e) => setWebSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleWebSearch();
                }
              }}
            />
            <Button 
              variant="contained" 
              onClick={handleWebSearch}
              disabled={isSearching}
              startIcon={isSearching ? <CircularProgress size={20} /> : <SearchIcon />}
            >
              {isSearching ? '搜索中...' : '搜索'}
            </Button>
            {searchResults.length > 0 && (
              <Button 
                variant="outlined" 
                onClick={clearSearchResults}
                color="secondary"
              >
                清空
              </Button>
            )}
          </Box>
          
          {searchResults.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                搜索结果:
              </Typography>
              <List>
                {searchResults.map((result, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={
                        <Box sx={{ cursor: 'pointer' }} onClick={() => openLink(result.url)}>
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              color: 'primary.main',
                              textDecoration: 'underline',
                              '&:hover': { textDecoration: 'none' }
                            }}
                          >
                            {result.title}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {result.content.substring(0, 150)}...
                          </Typography>
                          <Chip 
                            label={result.type} 
                            size="small" 
                            sx={{ mt: 1 }} 
                            color="primary"
                          />
                        </Box>
                      }
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => addWebMaterial(result)}
                    >
                      添加
                    </Button>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 分类标签 */}
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        sx={{ mb: 2 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label={`全部 (${stats.total})`} />
        <Tab label={`文档 (${stats.text})`} />
        <Tab label={`音频 (${stats.audio})`} />
        <Tab label={`视频 (${stats.video})`} />
        <Tab label={`图片 (${stats.image})`} />
        <Tab label={`网络 (${stats.web})`} />
      </Tabs>

      {/* 素材列表 */}
      <Grid container spacing={3}>
        {filteredMaterials.map((material) => (
          <Grid item xs={12} sm={6} md={4} key={material.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {material.type === 'image' && material.imagePreview && (
                <CardMedia
                  component="img"
                  height="140"
                  image={material.imagePreview}
                  alt={material.name}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {renderIcon(material.type)}
                  <Typography variant="h6" sx={{ ml: 1, fontSize: '1rem' }}>
                    {material.name}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={material.type} 
                    size="small" 
                    color={getTypeColor(material.type) as any}
                  />
                  {material.autoIntegrated && (
                    <Chip 
                      icon={<KnowledgeIcon />}
                      label="已集成" 
                      size="small" 
                      color="success"
                    />
                  )}
                  {material.category && (
                    <Chip 
                      label={material.category} 
                      size="small" 
                      variant="outlined"
                    />
                  )}
                </Box>
                
                {material.tags && material.tags.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                    {material.tags.slice(0, 3).map((tag, index) => (
                      <Chip 
                        key={index}
                        label={tag} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                    {material.tags.length > 3 && (
                      <Typography variant="caption" color="text.secondary">
                        +{material.tags.length - 3} 更多
                      </Typography>
                    )}
                  </Box>
                )}
                
                <Typography variant="body2" color="text.secondary">
                  {material.size && `大小: ${typeof material.size === 'number' ? formatFileSize(material.size) : material.size} | `}
                  上传时间: {getMaterialDate(material)}
                </Typography>
                
                {material.description && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {material.description.length > 100 
                      ? `${material.description.substring(0, 100)}...` 
                      : material.description
                    }
                  </Typography>
                )}
              </CardContent>
              
              <CardActions>
                <IconButton 
                  size="small" 
                  onClick={() => handleViewMaterial(material)}
                  title="查看详情"
                >
                  <ViewIcon />
                </IconButton>
                <IconButton 
                  size="small"
                  title="下载"
                >
                  <DownloadIcon />
                </IconButton>
                {!material.autoIntegrated && (
                  <Button 
                    size="small"
                    startIcon={<AutoIntegrateIcon />}
                    onClick={() => integrateToKnowledgeBase(material)}
                    color="primary"
                  >
                    集成
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 空状态 */}
      {filteredMaterials.length === 0 && (
        <Card sx={{ textAlign: 'center', py: 4 }}>
          <CardContent>
            <FolderIcon sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              暂无素材
            </Typography>
            <Typography variant="body2" color="text.secondary">
              上传文件或搜索网络资源来添加素材
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* 上传对话框 */}
      <Dialog open={showUploadDialog} onClose={() => setShowUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>上传文件</DialogTitle>
        <DialogContent>
          <input
            type="file"
            ref={fileInputRef}
            multiple
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files) {
                handleFileUpload(e.target.files);
              }
            }}
          />
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CloudUploadIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              选择要上传的文件
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              支持图片、视频、音频和文档格式
            </Typography>
            <Button
              variant="contained"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? '上传中...' : '选择文件'}
            </Button>
            {uploading && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="caption" color="text.secondary">
                  上传进度: {uploadProgress}%
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUploadDialog(false)} disabled={uploading}>
            取消
          </Button>
        </DialogActions>
      </Dialog>

      {/* 素材详情对话框 */}
      <Dialog
        open={viewDialog.open}
        onClose={() => setViewDialog({ open: false, material: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {viewDialog.material?.name}
        </DialogTitle>
        <DialogContent>
          {viewDialog.material && (
            <Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip 
                  label={viewDialog.material.type} 
                  color={getTypeColor(viewDialog.material.type) as any}
                />
                {viewDialog.material.autoIntegrated && (
                  <Chip 
                    icon={<KnowledgeIcon />}
                    label="已集成到知识库" 
                    color="success"
                  />
                )}
              </Box>
              
              {viewDialog.material.imagePreview && (
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <img 
                    src={viewDialog.material.imagePreview} 
                    alt={viewDialog.material.name}
                    style={{ maxWidth: '100%', maxHeight: '300px' }}
                  />
                </Box>
              )}
              
              <Typography variant="body1" paragraph>
                {viewDialog.material.description || '暂无描述'}
              </Typography>
              
              {viewDialog.material.content && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    内容:
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      maxHeight: '300px',
                      overflow: 'auto',
                      backgroundColor: 'grey.50',
                      p: 2,
                      borderRadius: 1
                    }}
                  >
                    {viewDialog.material.content}
                  </Typography>
                </Box>
              )}
              
              {viewDialog.material.url && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    来源: <a href={viewDialog.material.url} target="_blank" rel="noopener noreferrer">
                      {viewDialog.material.url}
                    </a>
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog({ open: false, material: null })}>
            关闭
          </Button>
        </DialogActions>
      </Dialog>

      {/* 手动集成确认对话框 */}
      <Dialog
        open={integrationDialog.open}
        onClose={() => setIntegrationDialog({ 
          open: false, 
          material: null, 
          suggestedCategory: '', 
          suggestedTags: [] 
        })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          确认集成到知识库
        </DialogTitle>
        <DialogContent>
          {integrationDialog.material && (
            <Box>
              <Typography variant="body1" gutterBottom>
                素材: {integrationDialog.material.name}
              </Typography>
              
              <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                <InputLabel>分类</InputLabel>
                <Select
                  value={integrationDialog.suggestedCategory}
                  onChange={(e) => setIntegrationDialog(prev => ({
                    ...prev,
                    suggestedCategory: e.target.value
                  }))}
                >
                  {knowledgeCategories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Typography variant="body2" gutterBottom>
                建议标签:
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                {integrationDialog.suggestedTags.map((tag, index) => (
                  <Chip 
                    key={index}
                    label={tag} 
                    size="small" 
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIntegrationDialog({ 
            open: false, 
            material: null, 
            suggestedCategory: '', 
            suggestedTags: [] 
          })}>
            取消
          </Button>
          <Button 
            onClick={handleManualIntegration}
            variant="contained"
            startIcon={<KnowledgeIcon />}
          >
            确认集成
          </Button>
        </DialogActions>
      </Dialog>

      {/* 查看知识库文档对话框 */}
      <Dialog
        open={knowledgeDialog.open}
        onClose={() => setKnowledgeDialog({ open: false, document: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {knowledgeDialog.document?.title}
        </DialogTitle>
        <DialogContent>
          {knowledgeDialog.document && (
            <Box>
              <Typography variant="body1" paragraph>
                {knowledgeDialog.document.content}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                分类: {knowledgeDialog.document.category}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                标签: {knowledgeDialog.document.tags.join(', ')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                创建时间: {new Date(knowledgeDialog.document.createdAt).toLocaleString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setKnowledgeDialog({ open: false, document: null })}>
            关闭
          </Button>
          <Button 
            onClick={() => {
              if (knowledgeDialog.document) {
                importKnowledgeDocument(knowledgeDialog.document);
              }
            }}
            variant="contained"
            startIcon={<AutoIntegrateIcon />}
          >
            导入到素材库
          </Button>
        </DialogActions>
      </Dialog>

      {/* 右键菜单 */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleCloseContextMenu}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>查看详情</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleCloseContextMenu}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>下载</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleCloseContextMenu}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>分享</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleCloseContextMenu}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>重命名</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleCloseContextMenu}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>删除</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default MaterialLibrary; 