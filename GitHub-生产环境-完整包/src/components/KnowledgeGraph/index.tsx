import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Paper,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Badge,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  AccountTree as GraphIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Settings as SettingsIcon,
  AutoFixHigh as AutoLearnIcon,
  TrendingUp as TrendingUpIcon,
  Psychology as AIIcon,
  School as LearnIcon,
  Lightbulb as InsightIcon,
  Timeline as AnalyticsIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusStrong as CenterIcon,
  Save as SaveIcon,
  Download as ExportIcon,
  Upload as ImportIcon,
  ExpandMore as ExpandMoreIcon,
  SmartToy as SmartIcon,
  AutoAwesome as MagicIcon
} from '@mui/icons-material';
import { KnowledgeDocument } from '../../types';

// Props接口定义
interface KnowledgeGraphProps {
  documents?: KnowledgeDocument[];
  onClose?: () => void;
}

interface KnowledgeNode {
  id: string;
  label: string;
  category: string;
  description: string;
  confidence: number;
  connections: number;
  lastUpdated: string;
  learningScore: number;
  importance: number;
  x?: number;
  y?: number;
}

interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  strength: number;
  confidence: number;
  autoGenerated: boolean;
  lastUpdated: string;
}

interface LearningInsight {
  id: string;
  type: 'pattern' | 'anomaly' | 'trend' | 'correlation';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  relatedNodes: string[];
  timestamp: string;
  actionable: boolean;
}

interface AutoLearningConfig {
  enabled: boolean;
  learningRate: number;
  confidenceThreshold: number;
  maxConnections: number;
  updateFrequency: 'realtime' | 'hourly' | 'daily';
  enablePatternDetection: boolean;
  enableAnomalyDetection: boolean;
  enableTrendAnalysis: boolean;
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ documents = [], onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [edges, setEdges] = useState<KnowledgeEdge[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [showNodeDialog, setShowNodeDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [learningInsights, setLearningInsights] = useState<LearningInsight[]>([]);
  const [autoLearningConfig, setAutoLearningConfig] = useState<AutoLearningConfig>({
    enabled: true,
    learningRate: 0.7,
    confidenceThreshold: 0.6,
    maxConnections: 10,
    updateFrequency: 'realtime',
    enablePatternDetection: true,
    enableAnomalyDetection: true,
    enableTrendAnalysis: true
  });
  const [isLearning, setIsLearning] = useState(false);
  const [learningProgress, setLearningProgress] = useState(0);
  const [graphStats, setGraphStats] = useState({
    totalNodes: 0,
    totalEdges: 0,
    avgConfidence: 0,
    learningAccuracy: 87.3,
    lastUpdate: new Date().toISOString()
  });

  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // 初始化知识图谱数据
  useEffect(() => {
    initializeKnowledgeGraph();
    if (autoLearningConfig.enabled) {
      startAutoLearning();
    }
  }, []);

  // 初始化知识图谱
  const initializeKnowledgeGraph = () => {
    const initialNodes: KnowledgeNode[] = [
      {
        id: 'battery-system',
        label: '电池系统',
        category: '核心组件',
        description: '电动汽车换电站的核心电池管理系统',
        confidence: 0.95,
        connections: 8,
        lastUpdated: new Date().toISOString(),
        learningScore: 0.92,
        importance: 0.98,
        x: 400,
        y: 300
      },
      {
        id: 'charging-station',
        label: '充电桩',
        category: '设备',
        description: '电池充电设备',
        confidence: 0.88,
        connections: 6,
        lastUpdated: new Date().toISOString(),
        learningScore: 0.85,
        importance: 0.87,
        x: 200,
        y: 200
      },
      {
        id: 'fault-diagnosis',
        label: '故障诊断',
        category: '功能',
        description: '智能故障检测与诊断系统',
        confidence: 0.91,
        connections: 12,
        lastUpdated: new Date().toISOString(),
        learningScore: 0.89,
        importance: 0.94,
        x: 600,
        y: 200
      },
      {
        id: 'thermal-management',
        label: '热管理',
        category: '系统',
        description: '电池热管理系统',
        confidence: 0.83,
        connections: 5,
        lastUpdated: new Date().toISOString(),
        learningScore: 0.78,
        importance: 0.82,
        x: 300,
        y: 400
      },
      {
        id: 'safety-system',
        label: '安全系统',
        category: '安全',
        description: '换电站安全保护系统',
        confidence: 0.96,
        connections: 9,
        lastUpdated: new Date().toISOString(),
        learningScore: 0.94,
        importance: 0.97,
        x: 500,
        y: 400
      }
    ];

    const initialEdges: KnowledgeEdge[] = [
      {
        id: 'edge-1',
        source: 'battery-system',
        target: 'charging-station',
        relationship: '连接',
        strength: 0.85,
        confidence: 0.92,
        autoGenerated: false,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'edge-2',
        source: 'battery-system',
        target: 'fault-diagnosis',
        relationship: '监控',
        strength: 0.91,
        confidence: 0.88,
        autoGenerated: true,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'edge-3',
        source: 'battery-system',
        target: 'thermal-management',
        relationship: '控制',
        strength: 0.78,
        confidence: 0.85,
        autoGenerated: true,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'edge-4',
        source: 'safety-system',
        target: 'battery-system',
        relationship: '保护',
        strength: 0.94,
        confidence: 0.96,
        autoGenerated: false,
        lastUpdated: new Date().toISOString()
      }
    ];

    setNodes(initialNodes);
    setEdges(initialEdges);
    updateGraphStats(initialNodes, initialEdges);
  };

  // 启动自动学习
  const startAutoLearning = async () => {
    setIsLearning(true);
    setLearningProgress(0);

    // 模拟学习过程
    for (let i = 0; i <= 100; i += 10) {
      setLearningProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      if (i === 50) {
        // 中途生成一些学习洞察
        generateLearningInsights();
      }
    }

    // 自动发现新的连接
    await discoverNewConnections();
    
    setIsLearning(false);
    setLearningProgress(0);
  };

  // 生成学习洞察
  const generateLearningInsights = () => {
    const insights: LearningInsight[] = [
      {
        id: 'insight-1',
        type: 'pattern',
        title: '发现故障模式关联',
        description: '系统发现电池温度异常与充电效率下降之间存在强相关性（相关系数：0.87）',
        confidence: 0.87,
        impact: 'high',
        relatedNodes: ['battery-system', 'thermal-management', 'charging-station'],
        timestamp: new Date().toISOString(),
        actionable: true
      },
      {
        id: 'insight-2',
        type: 'trend',
        title: '安全系统响应趋势',
        description: '过去30天内，安全系统响应时间平均缩短了15%，表明系统学习效果显著',
        confidence: 0.92,
        impact: 'medium',
        relatedNodes: ['safety-system', 'fault-diagnosis'],
        timestamp: new Date().toISOString(),
        actionable: false
      },
      {
        id: 'insight-3',
        type: 'anomaly',
        title: '异常连接检测',
        description: '检测到充电桩与热管理系统之间存在未知的间接影响关系',
        confidence: 0.73,
        impact: 'medium',
        relatedNodes: ['charging-station', 'thermal-management'],
        timestamp: new Date().toISOString(),
        actionable: true
      }
    ];

    setLearningInsights(insights);
  };

  // 自动发现新连接
  const discoverNewConnections = async () => {
    const newEdge: KnowledgeEdge = {
      id: `edge-auto-${Date.now()}`,
      source: 'charging-station',
      target: 'thermal-management',
      relationship: '影响',
      strength: 0.73,
      confidence: 0.68,
      autoGenerated: true,
      lastUpdated: new Date().toISOString()
    };

    setEdges(prev => [...prev, newEdge]);
    
    // 更新相关节点的连接数
    setNodes(prev => prev.map(node => {
      if (node.id === 'charging-station' || node.id === 'thermal-management') {
        return { ...node, connections: node.connections + 1 };
      }
      return node;
    }));
  };

  // 更新图谱统计
  const updateGraphStats = (nodeList: KnowledgeNode[], edgeList: KnowledgeEdge[]) => {
    const avgConfidence = nodeList.reduce((sum, node) => sum + node.confidence, 0) / nodeList.length;
    
    setGraphStats({
      totalNodes: nodeList.length,
      totalEdges: edgeList.length,
      avgConfidence: avgConfidence,
      learningAccuracy: 87.3 + Math.random() * 5, // 模拟动态变化
      lastUpdate: new Date().toISOString()
    });
  };

  // 过滤节点
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => 
      node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [nodes, searchTerm]);

  // 获取节点颜色
  const getNodeColor = (category: string) => {
    const categoryColors = {
      '核心组件': '#FF6B35',
      '设备': '#4ECDC4',
      '功能': '#45B7D1',
      '系统': '#96CEB4',
      '安全': '#FFEAA7'
    };
    return categoryColors[category as keyof typeof categoryColors] || '#DDA0DD';
  };

  // 获取重要性大小
  const getNodeSize = (importance: number) => {
    return 20 + importance * 30; // 20-50px
  };

  // 处理节点点击
  const handleNodeClick = (node: KnowledgeNode) => {
    setSelectedNode(node);
    setShowNodeDialog(true);
  };

  // 添加新节点
  const addNewNode = () => {
    const newNode: KnowledgeNode = {
      id: `node-${Date.now()}`,
      label: '新节点',
      category: '其他',
      description: '新添加的知识节点',
      confidence: 0.5,
      connections: 0,
      lastUpdated: new Date().toISOString(),
      learningScore: 0.0,
      importance: 0.5,
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100
    };

    setNodes(prev => [...prev, newNode]);
    updateGraphStats([...nodes, newNode], edges);
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* 标题和控制面板 */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <GraphIcon sx={{ fontSize: 40 }} />
              <Typography variant="h4" fontWeight="bold">
                智能知识图谱
              </Typography>
              <Badge badgeContent={isLearning ? '学习中' : '已更新'} color={isLearning ? 'warning' : 'success'}>
                <SmartIcon sx={{ fontSize: 32 }} />
              </Badge>
            </Box>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              基于AI的自动学习知识图谱，实时发现知识关联和模式洞察
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AIIcon sx={{ color: 'white' }} />
                  <Typography variant="h6" color="white">学习状态</Typography>
                </Box>
                <Typography variant="h4" color="white" fontWeight="bold">
                  {graphStats.learningAccuracy.toFixed(1)}%
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  学习准确率
                </Typography>
                {isLearning && (
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={learningProgress} 
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.3)',
                        '& .MuiLinearProgress-bar': { bgcolor: 'white' }
                      }} 
                    />
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      学习进度: {learningProgress}%
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* 功能标签页 */}
      <Paper elevation={1} sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<GraphIcon />} label="图谱视图" />
          <Tab icon={<InsightIcon />} label="学习洞察" />
          <Tab icon={<AnalyticsIcon />} label="统计分析" />
          <Tab icon={<SettingsIcon />} label="学习配置" />
        </Tabs>

        {/* 图谱视图 */}
        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            {/* 工具栏 */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="搜索节点..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={addNewNode}
                  >
                    添加节点
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<AutoLearnIcon />}
                    onClick={startAutoLearning}
                    disabled={isLearning}
                  >
                    {isLearning ? '学习中...' : '开始学习'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => updateGraphStats(nodes, edges)}
                  >
                    刷新
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<SettingsIcon />}
                    onClick={() => setShowSettingsDialog(true)}
                  >
                    设置
                  </Button>
                </Box>
              </Grid>
            </Grid>

            {/* 图谱统计卡片 */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {graphStats.totalNodes}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      知识节点
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {graphStats.totalEdges}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      关联边
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main">
                      {(graphStats.avgConfidence * 100).toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      平均置信度
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {learningInsights.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      学习洞察
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* SVG 图谱 */}
            <Card sx={{ height: 500, overflow: 'hidden' }}>
              <CardContent sx={{ height: '100%', p: 0 }}>
                <svg
                  ref={svgRef}
                  width="100%"
                  height="100%"
                  viewBox={`${-pan.x} ${-pan.y} ${800 / zoom} ${500 / zoom}`}
                  style={{ cursor: 'grab' }}
                >
                  {/* 绘制边 */}
                  {edges.map(edge => {
                    const sourceNode = nodes.find(n => n.id === edge.source);
                    const targetNode = nodes.find(n => n.id === edge.target);
                    if (!sourceNode || !targetNode) return null;

                    return (
                      <g key={edge.id}>
                        <line
                          x1={sourceNode.x}
                          y1={sourceNode.y}
                          x2={targetNode.x}
                          y2={targetNode.y}
                          stroke={edge.autoGenerated ? '#ff9800' : '#2196f3'}
                          strokeWidth={edge.strength * 3}
                          strokeOpacity={edge.confidence}
                          strokeDasharray={edge.autoGenerated ? '5,5' : 'none'}
                        />
                        <text
                          x={(sourceNode.x! + targetNode.x!) / 2}
                          y={(sourceNode.y! + targetNode.y!) / 2}
                          textAnchor="middle"
                          fontSize="10"
                          fill="#666"
                        >
                          {edge.relationship}
                        </text>
                      </g>
                    );
                  })}

                  {/* 绘制节点 */}
                  {filteredNodes.map(node => (
                    <g key={node.id} onClick={() => handleNodeClick(node)} style={{ cursor: 'pointer' }}>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={getNodeSize(node.importance)}
                        fill={getNodeColor(node.category)}
                        stroke="#fff"
                        strokeWidth="2"
                        opacity={node.confidence}
                      />
                      <text
                        x={node.x}
                        y={(node.y || 0) + 5}
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight="bold"
                        fill="#fff"
                      >
                        {node.label}
                      </text>
                      {/* 学习指示器 */}
                      {node.learningScore > 0.8 && (
                        <circle
                          cx={(node.x || 0) + getNodeSize(node.importance) - 5}
                          cy={(node.y || 0) - getNodeSize(node.importance) + 5}
                          r="5"
                          fill="#4caf50"
                        />
                      )}
                    </g>
                  ))}
                </svg>
              </CardContent>
            </Card>

            {/* 图谱控制 */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
              <IconButton onClick={() => setZoom(Math.min(zoom * 1.2, 3))}>
                <ZoomInIcon />
              </IconButton>
              <IconButton onClick={() => setZoom(Math.max(zoom / 1.2, 0.5))}>
                <ZoomOutIcon />
              </IconButton>
              <IconButton onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>
                <CenterIcon />
              </IconButton>
            </Box>
          </Box>
        )}

        {/* 学习洞察 */}
        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              AI学习洞察
            </Typography>
            {learningInsights.length === 0 ? (
              <Alert severity="info">
                暂无学习洞察，请启动自动学习功能
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {learningInsights.map(insight => (
                  <Grid item xs={12} md={6} key={insight.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Chip 
                            label={insight.type} 
                            size="small" 
                            color={insight.type === 'pattern' ? 'primary' : 
                                   insight.type === 'trend' ? 'success' : 
                                   insight.type === 'anomaly' ? 'warning' : 'default'}
                          />
                          <Chip 
                            label={`${insight.impact} 影响`} 
                            size="small" 
                            variant="outlined"
                            color={insight.impact === 'high' ? 'error' : 
                                   insight.impact === 'medium' ? 'warning' : 'success'}
                          />
                          {insight.actionable && (
                            <Chip label="可操作" size="small" color="info" />
                          )}
                        </Box>
                        <Typography variant="h6" gutterBottom>
                          {insight.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {insight.description}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            置信度: {(insight.confidence * 100).toFixed(1)}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(insight.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* 统计分析 */}
        {activeTab === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              图谱统计分析
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      节点分布
                    </Typography>
                    {/* 这里可以添加图表组件 */}
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography color="text.secondary">
                        节点分类统计图表
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      学习趋势
                    </Typography>
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography color="text.secondary">
                        学习准确率趋势图
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* 学习配置 */}
        {activeTab === 3 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              自动学习配置
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      基础设置
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={autoLearningConfig.enabled}
                          onChange={(e) => setAutoLearningConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                        />
                      }
                      label="启用自动学习"
                    />
                    <Box sx={{ mt: 2 }}>
                      <Typography gutterBottom>学习率</Typography>
                      <Slider
                        value={autoLearningConfig.learningRate}
                        onChange={(_, value) => setAutoLearningConfig(prev => ({ ...prev, learningRate: value as number }))}
                        min={0.1}
                        max={1.0}
                        step={0.1}
                        marks
                        valueLabelDisplay="auto"
                      />
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography gutterBottom>置信度阈值</Typography>
                      <Slider
                        value={autoLearningConfig.confidenceThreshold}
                        onChange={(_, value) => setAutoLearningConfig(prev => ({ ...prev, confidenceThreshold: value as number }))}
                        min={0.1}
                        max={1.0}
                        step={0.1}
                        marks
                        valueLabelDisplay="auto"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      高级设置
                    </Typography>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>更新频率</InputLabel>
                      <Select
                        value={autoLearningConfig.updateFrequency}
                        onChange={(e) => setAutoLearningConfig(prev => ({ ...prev, updateFrequency: e.target.value as any }))}
                        label="更新频率"
                      >
                        <MenuItem value="realtime">实时</MenuItem>
                        <MenuItem value="hourly">每小时</MenuItem>
                        <MenuItem value="daily">每日</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={autoLearningConfig.enablePatternDetection}
                          onChange={(e) => setAutoLearningConfig(prev => ({ ...prev, enablePatternDetection: e.target.checked }))}
                        />
                      }
                      label="启用模式检测"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={autoLearningConfig.enableAnomalyDetection}
                          onChange={(e) => setAutoLearningConfig(prev => ({ ...prev, enableAnomalyDetection: e.target.checked }))}
                        />
                      }
                      label="启用异常检测"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={autoLearningConfig.enableTrendAnalysis}
                          onChange={(e) => setAutoLearningConfig(prev => ({ ...prev, enableTrendAnalysis: e.target.checked }))}
                        />
                      }
                      label="启用趋势分析"
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* 节点详情对话框 */}
      <Dialog open={showNodeDialog} onClose={() => setShowNodeDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          节点详情
        </DialogTitle>
        <DialogContent>
          {selectedNode && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    {selectedNode.label}
                  </Typography>
                  <Chip label={selectedNode.category} color="primary" sx={{ mb: 2 }} />
                  <Typography variant="body1" paragraph>
                    {selectedNode.description}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    节点指标
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      置信度: {(selectedNode.confidence * 100).toFixed(1)}%
                    </Typography>
                    <LinearProgress variant="determinate" value={selectedNode.confidence * 100} />
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      学习分数: {(selectedNode.learningScore * 100).toFixed(1)}%
                    </Typography>
                    <LinearProgress variant="determinate" value={selectedNode.learningScore * 100} color="success" />
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      重要性: {(selectedNode.importance * 100).toFixed(1)}%
                    </Typography>
                    <LinearProgress variant="determinate" value={selectedNode.importance * 100} color="warning" />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    连接数: {selectedNode.connections}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    最后更新: {new Date(selectedNode.lastUpdated).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNodeDialog(false)}>
            关闭
          </Button>
          <Button variant="contained" startIcon={<EditIcon />}>
            编辑
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KnowledgeGraph; 