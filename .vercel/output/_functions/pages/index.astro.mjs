import { e as createComponent, k as renderComponent, r as renderTemplate } from '../chunks/astro/server_BuDLk9JT.mjs';
import 'piccolore';
import { a as cn, B as Button, c as createSlot$4, u as useToast, C as Card, b as CardHeader, d as CardTitle, f as CardContent, g as formatFileSize, h as formatDate, i as CardFooter, j as composeRefs, k as useComposedRefs, $ as $$Layout } from '../chunks/use-toast_D1TYwyzs.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import * as React from 'react';
import React__default, { useState, useEffect, useCallback, useRef } from 'react';
import { Folder, ChevronDown, ChevronRight, FolderOpen, Sparkles, Trash2, FileText, CheckCircle2, AlertCircle, File, Calendar, Loader2, Clock, RefreshCw, X, XCircle, Upload, Check, Circle, Home, MessageCircle, Search, Tag, Menu as Menu$1, FileEdit, Users, Settings, LogOut } from 'lucide-react';
import { d as db, e as folders, f as files } from '../chunks/index_B-AYb3H8.mjs';
import { cva } from 'class-variance-authority';
import * as ReactDOM from 'react-dom';
import ReactDOM__default from 'react-dom';
import { composeEventHandlers } from '@radix-ui/primitive';
import { RemoveScroll } from 'react-remove-scroll';
import { hideOthers } from 'aria-hidden';
import { clamp } from '@radix-ui/number';
import { useFloating, offset, shift, limitShift, flip, size, arrow, hide, autoUpdate } from '@floating-ui/react-dom';
import { isNull } from 'drizzle-orm';
export { renderers } from '../renderers.mjs';

function buildTree(folders, parentId = null) {
  return folders.filter((f) => f.parentId === parentId).map((folder) => ({
    ...folder,
    id: String(folder.id),
    parentId: folder.parentId ? String(folder.parentId) : null,
    createdAt: folder.createdAt || /* @__PURE__ */ new Date(),
    updatedAt: folder.updatedAt || /* @__PURE__ */ new Date(),
    children: buildTree(folders, String(folder.id))
  }));
}

function TreeNode({ node, level, selectedFolderId, onFolderSelect, onFolderDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedFolderId === node.id;
  const canDelete = level >= 1;
  const handleClick = (e) => {
    if (e.target.closest("button")) return;
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
    onFolderSelect?.(String(node.id));
  };
  const handleAnalyze = (e) => {
    e.stopPropagation();
    window.location.href = `/analyze?folderId=${String(node.id)}&folderName=${encodeURIComponent(String(node.name))}`;
  };
  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm(`确定要删除文件夹"${String(node.name)}"吗？`)) {
      onFolderDelete?.(String(node.id));
    }
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent transition-colors group",
          isSelected && "bg-accent"
        ),
        style: { paddingLeft: `${level * 16 + 8}px` },
        onClick: handleClick,
        children: [
          hasChildren ? isExpanded ? /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 text-muted-foreground" }) : /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4 text-muted-foreground" }) : /* @__PURE__ */ jsx("div", { className: "w-4 h-4" }),
          isExpanded ? /* @__PURE__ */ jsx(FolderOpen, { className: "h-4 w-4 text-blue-500" }) : /* @__PURE__ */ jsx(Folder, { className: "h-4 w-4 text-blue-500" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm flex-1 truncate", children: String(node.name) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "ghost",
                size: "sm",
                className: "h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity",
                onClick: handleAnalyze,
                title: "AI分析文件夹",
                children: /* @__PURE__ */ jsx(Sparkles, { className: "h-3 w-3" })
              }
            ),
            canDelete && /* @__PURE__ */ jsx(
              Button,
              {
                variant: "ghost",
                size: "sm",
                className: "h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50",
                onClick: handleDelete,
                title: "删除文件夹",
                children: /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" })
              }
            )
          ] })
        ]
      }
    ),
    hasChildren && isExpanded && /* @__PURE__ */ jsx("div", { children: node.children.map((child) => /* @__PURE__ */ jsx(
      TreeNode,
      {
        node: child,
        level: level + 1,
        selectedFolderId,
        onFolderSelect,
        onFolderDelete
      },
      String(child.id)
    )) })
  ] });
}
function FileTree({ folders, selectedFolderId, onFolderSelect, onFolderDelete }) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn(
          "flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md hover:bg-accent transition-colors",
          selectedFolderId === null && "bg-accent"
        ),
        onClick: () => onFolderSelect?.(null),
        children: [
          /* @__PURE__ */ jsx(Folder, { className: "h-4 w-4 text-blue-500" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm", children: "星界母基金" })
        ]
      }
    ),
    folders.map((folder) => /* @__PURE__ */ jsx(
      TreeNode,
      {
        node: folder,
        level: 0,
        selectedFolderId,
        onFolderSelect,
        onFolderDelete
      },
      String(folder.id)
    ))
  ] });
}

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn(badgeVariants({ variant }), className), ...props });
}

// src/create-context.tsx
function createContextScope$1(scopeName, createContextScopeDeps = []) {
  let defaultContexts = [];
  function createContext3(rootComponentName, defaultContext) {
    const BaseContext = React.createContext(defaultContext);
    BaseContext.displayName = rootComponentName + "Context";
    const index = defaultContexts.length;
    defaultContexts = [...defaultContexts, defaultContext];
    const Provider = (props) => {
      const { scope, children, ...context } = props;
      const Context = scope?.[scopeName]?.[index] || BaseContext;
      const value = React.useMemo(() => context, Object.values(context));
      return /* @__PURE__ */ jsx(Context.Provider, { value, children });
    };
    Provider.displayName = rootComponentName + "Provider";
    function useContext2(consumerName, scope) {
      const Context = scope?.[scopeName]?.[index] || BaseContext;
      const context = React.useContext(Context);
      if (context) return context;
      if (defaultContext !== void 0) return defaultContext;
      throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
    }
    return [Provider, useContext2];
  }
  const createScope = () => {
    const scopeContexts = defaultContexts.map((defaultContext) => {
      return React.createContext(defaultContext);
    });
    return function useScope(scope) {
      const contexts = scope?.[scopeName] || scopeContexts;
      return React.useMemo(
        () => ({ [`__scope${scopeName}`]: { ...scope, [scopeName]: contexts } }),
        [scope, contexts]
      );
    };
  };
  createScope.scopeName = scopeName;
  return [createContext3, composeContextScopes$1(createScope, ...createContextScopeDeps)];
}
function composeContextScopes$1(...scopes) {
  const baseScope = scopes[0];
  if (scopes.length === 1) return baseScope;
  const createScope = () => {
    const scopeHooks = scopes.map((createScope2) => ({
      useScope: createScope2(),
      scopeName: createScope2.scopeName
    }));
    return function useComposedScopes(overrideScopes) {
      const nextScopes = scopeHooks.reduce((nextScopes2, { useScope, scopeName }) => {
        const scopeProps = useScope(overrideScopes);
        const currentScope = scopeProps[`__scope${scopeName}`];
        return { ...nextScopes2, ...currentScope };
      }, {});
      return React.useMemo(() => ({ [`__scope${baseScope.scopeName}`]: nextScopes }), [nextScopes]);
    };
  };
  createScope.scopeName = baseScope.scopeName;
  return createScope;
}

// src/primitive.tsx
var NODES$1 = [
  "a",
  "button",
  "div",
  "form",
  "h2",
  "h3",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "select",
  "span",
  "svg",
  "ul"
];
var Primitive$1 = NODES$1.reduce((primitive, node) => {
  const Slot = createSlot$4(`Primitive.${node}`);
  const Node = React.forwardRef((props, forwardedRef) => {
    const { asChild, ...primitiveProps } = props;
    const Comp = asChild ? Slot : node;
    if (typeof window !== "undefined") {
      window[Symbol.for("radix-ui")] = true;
    }
    return /* @__PURE__ */ jsx(Comp, { ...primitiveProps, ref: forwardedRef });
  });
  Node.displayName = `Primitive.${node}`;
  return { ...primitive, [node]: Node };
}, {});

var PROGRESS_NAME = "Progress";
var DEFAULT_MAX = 100;
var [createProgressContext] = createContextScope$1(PROGRESS_NAME);
var [ProgressProvider, useProgressContext] = createProgressContext(PROGRESS_NAME);
var Progress$1 = React.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeProgress,
      value: valueProp = null,
      max: maxProp,
      getValueLabel = defaultGetValueLabel,
      ...progressProps
    } = props;
    if ((maxProp || maxProp === 0) && !isValidMaxNumber(maxProp)) {
      console.error(getInvalidMaxError(`${maxProp}`, "Progress"));
    }
    const max = isValidMaxNumber(maxProp) ? maxProp : DEFAULT_MAX;
    if (valueProp !== null && !isValidValueNumber(valueProp, max)) {
      console.error(getInvalidValueError(`${valueProp}`, "Progress"));
    }
    const value = isValidValueNumber(valueProp, max) ? valueProp : null;
    const valueLabel = isNumber(value) ? getValueLabel(value, max) : void 0;
    return /* @__PURE__ */ jsx(ProgressProvider, { scope: __scopeProgress, value, max, children: /* @__PURE__ */ jsx(
      Primitive$1.div,
      {
        "aria-valuemax": max,
        "aria-valuemin": 0,
        "aria-valuenow": isNumber(value) ? value : void 0,
        "aria-valuetext": valueLabel,
        role: "progressbar",
        "data-state": getProgressState(value, max),
        "data-value": value ?? void 0,
        "data-max": max,
        ...progressProps,
        ref: forwardedRef
      }
    ) });
  }
);
Progress$1.displayName = PROGRESS_NAME;
var INDICATOR_NAME$1 = "ProgressIndicator";
var ProgressIndicator = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeProgress, ...indicatorProps } = props;
    const context = useProgressContext(INDICATOR_NAME$1, __scopeProgress);
    return /* @__PURE__ */ jsx(
      Primitive$1.div,
      {
        "data-state": getProgressState(context.value, context.max),
        "data-value": context.value ?? void 0,
        "data-max": context.max,
        ...indicatorProps,
        ref: forwardedRef
      }
    );
  }
);
ProgressIndicator.displayName = INDICATOR_NAME$1;
function defaultGetValueLabel(value, max) {
  return `${Math.round(value / max * 100)}%`;
}
function getProgressState(value, maxValue) {
  return value == null ? "indeterminate" : value === maxValue ? "complete" : "loading";
}
function isNumber(value) {
  return typeof value === "number";
}
function isValidMaxNumber(max) {
  return isNumber(max) && !isNaN(max) && max > 0;
}
function isValidValueNumber(value, max) {
  return isNumber(value) && !isNaN(value) && value <= max && value >= 0;
}
function getInvalidMaxError(propValue, componentName) {
  return `Invalid prop \`max\` of value \`${propValue}\` supplied to \`${componentName}\`. Only numbers greater than 0 are valid max values. Defaulting to \`${DEFAULT_MAX}\`.`;
}
function getInvalidValueError(propValue, componentName) {
  return `Invalid prop \`value\` of value \`${propValue}\` supplied to \`${componentName}\`. The \`value\` prop must be:
  - a positive number
  - less than the value passed to \`max\` (or ${DEFAULT_MAX} if no \`max\` prop is set)
  - \`null\` or \`undefined\` if the progress is indeterminate.

Defaulting to \`null\`.`;
}
var Root$4 = Progress$1;
var Indicator = ProgressIndicator;

const Progress = React.forwardRef(({ className, value, ...props }, ref) => /* @__PURE__ */ jsx(
  Root$4,
  {
    ref,
    className: cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(
      Indicator,
      {
        className: "h-full w-full flex-1 bg-primary transition-all",
        style: { transform: `translateX(-${100 - (value || 0)}%)` }
      }
    )
  }
));
Progress.displayName = Root$4.displayName;

function FileCard({ file, onDelete, onProcessed }) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("idle");
  const [parseStatus, setParseStatus] = useState({ status: "idle" });
  const hasProcessableContent = !!(file.fullContent || file.contentPreview);
  const isUsingPreview = !file.fullContent && !!file.contentPreview;
  const needsFullParsing = !file.fullContent && file.mimeType?.includes("pdf");
  useEffect(() => {
    if (!needsFullParsing) return;
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/parse/status?fileId=${file.id}`);
        if (response.ok) {
          const data = await response.json();
          setParseStatus({
            status: data.status,
            queuePosition: data.queuePosition,
            currentProcessing: data.currentProcessing,
            error: data.error
          });
          if (data.status === "completed" && !file.fullContent) {
            onProcessed?.(file.id);
          }
        }
      } catch (error) {
        console.error("[FileCard] 查询解析状态失败:", error);
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 5e3);
    return () => clearInterval(interval);
  }, [file.id, file.fullContent, needsFullParsing, onProcessed]);
  const handleProcessEmbedding = async () => {
    if (!hasProcessableContent) {
      toast({
        title: "无法处理",
        description: "文件内容为空，请先上传文件",
        variant: "destructive"
      });
      return;
    }
    setIsProcessing(true);
    setProcessingStep("chunking");
    try {
      const response = await fetch("/api/embeddings/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: file.id })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "处理失败");
      }
      setProcessingStep("embedding");
      await new Promise((resolve) => setTimeout(resolve, 500));
      const result = await response.json();
      setProcessingStep("done");
      toast({
        title: "处理成功",
        description: isUsingPreview ? `使用预览内容创建 ${result.chunksCreated} 个文档块，使用 ${result.totalTokensUsed} tokens` : `已创建 ${result.chunksCreated} 个文档块，使用 ${result.totalTokensUsed} tokens`
      });
      onProcessed?.(file.id);
      setTimeout(() => {
        setProcessingStep("idle");
      }, 2e3);
    } catch (error) {
      setProcessingStep("idle");
      toast({
        title: "处理失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  const handleRetryParse = async () => {
    try {
      const response = await fetch("/api/parse/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: file.id })
      });
      if (!response.ok) {
        throw new Error("重试失败");
      }
      toast({
        title: "已重新加入队列",
        description: "解析任务将在后台处理"
      });
      setParseStatus({ status: "pending" });
    } catch (error) {
      toast({
        title: "重试失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive"
      });
    }
  };
  const handleChat = () => {
    window.location.href = `/chat?fileId=${file.id}`;
  };
  const renderParseStatus = () => {
    if (parseStatus.status === "idle" || parseStatus.status === "completed" || file.fullContent) {
      return null;
    }
    if (parseStatus.status === "pending") {
      return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Clock, { className: "h-3 w-3" }),
          /* @__PURE__ */ jsx("span", { children: parseStatus.queuePosition && parseStatus.queuePosition > 0 ? `排队中，前方还有 ${parseStatus.queuePosition} 个文件` : "排队中，即将开始解析" })
        ] }),
        parseStatus.currentProcessing && /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
          "正在处理: ",
          parseStatus.currentProcessing.fileName
        ] }),
        /* @__PURE__ */ jsx(Progress, { value: 10, className: "h-1" })
      ] });
    }
    if (parseStatus.status === "processing") {
      return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin" }),
          /* @__PURE__ */ jsx("span", { children: "正在解析 PDF 文件..." })
        ] }),
        /* @__PURE__ */ jsx(Progress, { value: 50, className: "h-1" })
      ] });
    }
    if (parseStatus.status === "failed") {
      return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-destructive", children: [
          /* @__PURE__ */ jsx(AlertCircle, { className: "h-3 w-3" }),
          /* @__PURE__ */ jsx("span", { children: "解析失败" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: parseStatus.error?.substring(0, 50) }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            size: "sm",
            variant: "outline",
            className: "h-7 text-xs",
            onClick: handleRetryParse,
            children: [
              /* @__PURE__ */ jsx(RefreshCw, { className: "h-3 w-3 mr-1" }),
              "重试"
            ]
          }
        )
      ] });
    }
    return null;
  };
  return /* @__PURE__ */ jsxs(Card, { className: "hover:shadow-md transition-shadow flex flex-col h-full", children: [
    /* @__PURE__ */ jsx(CardHeader, { className: "pb-2 md:pb-3 px-3 md:px-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 md:gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4 md:h-5 md:w-5 text-red-500 flex-shrink-0" }),
        /* @__PURE__ */ jsx(
          CardTitle,
          {
            className: "text-xs md:text-sm truncate hover:text-primary cursor-pointer transition-colors",
            onClick: () => {
              const previewUrl = `/api/files/${file.id}/download`;
              window.open(previewUrl, "_blank", "noopener,noreferrer");
            },
            title: "点击预览文档",
            children: file.name
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-end gap-1 flex-shrink-0", children: [
        file.processedForEmbedding && /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "text-xs bg-green-50 text-green-700 border-green-200", children: [
          /* @__PURE__ */ jsx(CheckCircle2, { className: "h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5 md:mr-1" }),
          /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "已处理" }),
          /* @__PURE__ */ jsx("span", { className: "sm:hidden", children: "OK" })
        ] }),
        isUsingPreview && !file.processedForEmbedding && /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "text-xs bg-amber-50 text-amber-700 border-amber-200", children: [
          /* @__PURE__ */ jsx(AlertCircle, { className: "h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5 md:mr-1" }),
          /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "预览模式" }),
          /* @__PURE__ */ jsx("span", { className: "sm:hidden", children: "预览" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-1.5 md:space-y-2 pb-2 md:pb-3 px-3 md:px-6 flex-1", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsx(File, { className: "h-3 w-3" }),
        /* @__PURE__ */ jsx("span", { children: formatFileSize(Number(file.fileSize)) })
      ] }),
      file.chunkCount && file.chunkCount > 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "h-3 w-3" }),
        /* @__PURE__ */ jsxs("span", { children: [
          file.chunkCount,
          " 个文档块"
        ] })
      ] }),
      file.contentPreview && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground line-clamp-2 md:line-clamp-3 bg-muted/50 p-2 rounded-md", children: file.contentPreview }),
      renderParseStatus(),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Calendar, { className: "h-3 w-3" }),
        /* @__PURE__ */ jsx("span", { children: file.uploadedAt ? formatDate(new Date(file.uploadedAt)) : "未知日期" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(CardFooter, { className: "gap-2 flex-wrap pt-2 px-3 md:px-6 mt-auto", children: [
      !file.processedForEmbedding ? /* @__PURE__ */ jsx(
        Button,
        {
          size: "sm",
          className: "flex-1 min-w-[100px] md:min-w-[120px] min-h-[44px] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm",
          onClick: handleProcessEmbedding,
          disabled: isProcessing || !hasProcessableContent || parseStatus.status === "processing" || parseStatus.status === "pending",
          children: isProcessing ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 mr-1.5 md:mr-2 animate-spin" }),
            processingStep === "chunking" && "分块中...",
            processingStep === "embedding" && "生成向量...",
            processingStep === "done" && "完成!"
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 mr-1.5 md:mr-2" }),
            parseStatus.status === "pending" || parseStatus.status === "processing" ? "解析中..." : "处理文档"
          ] })
        }
      ) : /* @__PURE__ */ jsxs(
        Button,
        {
          size: "sm",
          variant: "default",
          className: "flex-1 min-w-[100px] md:min-w-[120px] min-h-[44px] bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-sm",
          onClick: handleChat,
          children: [
            /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 mr-1.5 md:mr-2" }),
            "智能对话"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        Button,
        {
          size: "sm",
          variant: "outline",
          className: "min-h-[44px] min-w-[44px] px-3 md:px-4",
          onClick: () => {
            const previewUrl = `/api/files/${file.id}/download`;
            window.open(previewUrl, "_blank", "noopener,noreferrer");
          },
          children: [
            /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "预览" }),
            /* @__PURE__ */ jsx(File, { className: "h-4 w-4 sm:hidden" })
          ]
        }
      ),
      onDelete && /* @__PURE__ */ jsxs(
        Button,
        {
          size: "sm",
          variant: "ghost",
          className: "text-destructive hover:text-destructive hover:bg-destructive/10 min-h-[44px] min-w-[44px] px-3 md:px-4",
          onClick: () => onDelete(file.id),
          children: [
            /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "删除" }),
            /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "h-4 w-4 sm:hidden", children: [
              /* @__PURE__ */ jsx("path", { d: "M3 6h18" }),
              /* @__PURE__ */ jsx("path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }),
              /* @__PURE__ */ jsx("path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" })
            ] })
          ]
        }
      )
    ] })
  ] });
}

// packages/react/context/src/create-context.tsx
function createContext2(rootComponentName, defaultContext) {
  const Context = React.createContext(defaultContext);
  const Provider = (props) => {
    const { children, ...context } = props;
    const value = React.useMemo(() => context, Object.values(context));
    return /* @__PURE__ */ jsx(Context.Provider, { value, children });
  };
  Provider.displayName = rootComponentName + "Provider";
  function useContext2(consumerName) {
    const context = React.useContext(Context);
    if (context) return context;
    if (defaultContext !== void 0) return defaultContext;
    throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
  }
  return [Provider, useContext2];
}
function createContextScope(scopeName, createContextScopeDeps = []) {
  let defaultContexts = [];
  function createContext3(rootComponentName, defaultContext) {
    const BaseContext = React.createContext(defaultContext);
    const index = defaultContexts.length;
    defaultContexts = [...defaultContexts, defaultContext];
    const Provider = (props) => {
      const { scope, children, ...context } = props;
      const Context = scope?.[scopeName]?.[index] || BaseContext;
      const value = React.useMemo(() => context, Object.values(context));
      return /* @__PURE__ */ jsx(Context.Provider, { value, children });
    };
    Provider.displayName = rootComponentName + "Provider";
    function useContext2(consumerName, scope) {
      const Context = scope?.[scopeName]?.[index] || BaseContext;
      const context = React.useContext(Context);
      if (context) return context;
      if (defaultContext !== void 0) return defaultContext;
      throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
    }
    return [Provider, useContext2];
  }
  const createScope = () => {
    const scopeContexts = defaultContexts.map((defaultContext) => {
      return React.createContext(defaultContext);
    });
    return function useScope(scope) {
      const contexts = scope?.[scopeName] || scopeContexts;
      return React.useMemo(
        () => ({ [`__scope${scopeName}`]: { ...scope, [scopeName]: contexts } }),
        [scope, contexts]
      );
    };
  };
  createScope.scopeName = scopeName;
  return [createContext3, composeContextScopes(createScope, ...createContextScopeDeps)];
}
function composeContextScopes(...scopes) {
  const baseScope = scopes[0];
  if (scopes.length === 1) return baseScope;
  const createScope = () => {
    const scopeHooks = scopes.map((createScope2) => ({
      useScope: createScope2(),
      scopeName: createScope2.scopeName
    }));
    return function useComposedScopes(overrideScopes) {
      const nextScopes = scopeHooks.reduce((nextScopes2, { useScope, scopeName }) => {
        const scopeProps = useScope(overrideScopes);
        const currentScope = scopeProps[`__scope${scopeName}`];
        return { ...nextScopes2, ...currentScope };
      }, {});
      return React.useMemo(() => ({ [`__scope${baseScope.scopeName}`]: nextScopes }), [nextScopes]);
    };
  };
  createScope.scopeName = baseScope.scopeName;
  return createScope;
}

// packages/react/use-layout-effect/src/use-layout-effect.tsx
var useLayoutEffect2 = globalThis?.document ? React.useLayoutEffect : () => {
};

// packages/react/id/src/id.tsx
var useReactId = React[" useId ".trim().toString()] || (() => void 0);
var count$1 = 0;
function useId(deterministicId) {
  const [id, setId] = React.useState(useReactId());
  useLayoutEffect2(() => {
    setId((reactId) => reactId ?? String(count$1++));
  }, [deterministicId]);
  return (id ? `radix-${id}` : "");
}

// src/use-controllable-state.tsx
var useInsertionEffect = React[" useInsertionEffect ".trim().toString()] || useLayoutEffect2;
function useControllableState({
  prop,
  defaultProp,
  onChange = () => {
  },
  caller
}) {
  const [uncontrolledProp, setUncontrolledProp, onChangeRef] = useUncontrolledState({
    defaultProp,
    onChange
  });
  const isControlled = prop !== void 0;
  const value = isControlled ? prop : uncontrolledProp;
  {
    const isControlledRef = React.useRef(prop !== void 0);
    React.useEffect(() => {
      const wasControlled = isControlledRef.current;
      if (wasControlled !== isControlled) {
        const from = wasControlled ? "controlled" : "uncontrolled";
        const to = isControlled ? "controlled" : "uncontrolled";
        console.warn(
          `${caller} is changing from ${from} to ${to}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`
        );
      }
      isControlledRef.current = isControlled;
    }, [isControlled, caller]);
  }
  const setValue = React.useCallback(
    (nextValue) => {
      if (isControlled) {
        const value2 = isFunction(nextValue) ? nextValue(prop) : nextValue;
        if (value2 !== prop) {
          onChangeRef.current?.(value2);
        }
      } else {
        setUncontrolledProp(nextValue);
      }
    },
    [isControlled, prop, setUncontrolledProp, onChangeRef]
  );
  return [value, setValue];
}
function useUncontrolledState({
  defaultProp,
  onChange
}) {
  const [value, setValue] = React.useState(defaultProp);
  const prevValueRef = React.useRef(value);
  const onChangeRef = React.useRef(onChange);
  useInsertionEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  React.useEffect(() => {
    if (prevValueRef.current !== value) {
      onChangeRef.current?.(value);
      prevValueRef.current = value;
    }
  }, [value, prevValueRef]);
  return [value, setValue, onChangeRef];
}
function isFunction(value) {
  return typeof value === "function";
}

// src/slot.tsx
// @__NO_SIDE_EFFECTS__
function createSlot$3(ownerName) {
  const SlotClone = /* @__PURE__ */ createSlotClone$3(ownerName);
  const Slot2 = React.forwardRef((props, forwardedRef) => {
    const { children, ...slotProps } = props;
    const childrenArray = React.Children.toArray(children);
    const slottable = childrenArray.find(isSlottable$3);
    if (slottable) {
      const newElement = slottable.props.children;
      const newChildren = childrenArray.map((child) => {
        if (child === slottable) {
          if (React.Children.count(newElement) > 1) return React.Children.only(null);
          return React.isValidElement(newElement) ? newElement.props.children : null;
        } else {
          return child;
        }
      });
      return /* @__PURE__ */ jsx(SlotClone, { ...slotProps, ref: forwardedRef, children: React.isValidElement(newElement) ? React.cloneElement(newElement, void 0, newChildren) : null });
    }
    return /* @__PURE__ */ jsx(SlotClone, { ...slotProps, ref: forwardedRef, children });
  });
  Slot2.displayName = `${ownerName}.Slot`;
  return Slot2;
}
// @__NO_SIDE_EFFECTS__
function createSlotClone$3(ownerName) {
  const SlotClone = React.forwardRef((props, forwardedRef) => {
    const { children, ...slotProps } = props;
    if (React.isValidElement(children)) {
      const childrenRef = getElementRef$4(children);
      const props2 = mergeProps$3(slotProps, children.props);
      if (children.type !== React.Fragment) {
        props2.ref = forwardedRef ? composeRefs(forwardedRef, childrenRef) : childrenRef;
      }
      return React.cloneElement(children, props2);
    }
    return React.Children.count(children) > 1 ? React.Children.only(null) : null;
  });
  SlotClone.displayName = `${ownerName}.SlotClone`;
  return SlotClone;
}
var SLOTTABLE_IDENTIFIER$3 = Symbol("radix.slottable");
function isSlottable$3(child) {
  return React.isValidElement(child) && typeof child.type === "function" && "__radixId" in child.type && child.type.__radixId === SLOTTABLE_IDENTIFIER$3;
}
function mergeProps$3(slotProps, childProps) {
  const overrideProps = { ...childProps };
  for (const propName in childProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];
    const isHandler = /^on[A-Z]/.test(propName);
    if (isHandler) {
      if (slotPropValue && childPropValue) {
        overrideProps[propName] = (...args) => {
          const result = childPropValue(...args);
          slotPropValue(...args);
          return result;
        };
      } else if (slotPropValue) {
        overrideProps[propName] = slotPropValue;
      }
    } else if (propName === "style") {
      overrideProps[propName] = { ...slotPropValue, ...childPropValue };
    } else if (propName === "className") {
      overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(" ");
    }
  }
  return { ...slotProps, ...overrideProps };
}
function getElementRef$4(element) {
  let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
  let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.ref;
  }
  getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
  mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.props.ref;
  }
  return element.props.ref || element.ref;
}

// src/primitive.tsx
var NODES = [
  "a",
  "button",
  "div",
  "form",
  "h2",
  "h3",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "select",
  "span",
  "svg",
  "ul"
];
var Primitive = NODES.reduce((primitive, node) => {
  const Slot = createSlot$3(`Primitive.${node}`);
  const Node = React.forwardRef((props, forwardedRef) => {
    const { asChild, ...primitiveProps } = props;
    const Comp = asChild ? Slot : node;
    if (typeof window !== "undefined") {
      window[Symbol.for("radix-ui")] = true;
    }
    return /* @__PURE__ */ jsx(Comp, { ...primitiveProps, ref: forwardedRef });
  });
  Node.displayName = `Primitive.${node}`;
  return { ...primitive, [node]: Node };
}, {});
function dispatchDiscreteCustomEvent(target, event) {
  if (target) ReactDOM.flushSync(() => target.dispatchEvent(event));
}

// packages/react/use-callback-ref/src/use-callback-ref.tsx
function useCallbackRef(callback) {
  const callbackRef = React.useRef(callback);
  React.useEffect(() => {
    callbackRef.current = callback;
  });
  return React.useMemo(() => (...args) => callbackRef.current?.(...args), []);
}

// packages/react/use-escape-keydown/src/use-escape-keydown.tsx
function useEscapeKeydown(onEscapeKeyDownProp, ownerDocument = globalThis?.document) {
  const onEscapeKeyDown = useCallbackRef(onEscapeKeyDownProp);
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onEscapeKeyDown(event);
      }
    };
    ownerDocument.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => ownerDocument.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [onEscapeKeyDown, ownerDocument]);
}

var DISMISSABLE_LAYER_NAME = "DismissableLayer";
var CONTEXT_UPDATE = "dismissableLayer.update";
var POINTER_DOWN_OUTSIDE = "dismissableLayer.pointerDownOutside";
var FOCUS_OUTSIDE = "dismissableLayer.focusOutside";
var originalBodyPointerEvents;
var DismissableLayerContext = React.createContext({
  layers: /* @__PURE__ */ new Set(),
  layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
  branches: /* @__PURE__ */ new Set()
});
var DismissableLayer = React.forwardRef(
  (props, forwardedRef) => {
    const {
      disableOutsidePointerEvents = false,
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside,
      onInteractOutside,
      onDismiss,
      ...layerProps
    } = props;
    const context = React.useContext(DismissableLayerContext);
    const [node, setNode] = React.useState(null);
    const ownerDocument = node?.ownerDocument ?? globalThis?.document;
    const [, force] = React.useState({});
    const composedRefs = useComposedRefs(forwardedRef, (node2) => setNode(node2));
    const layers = Array.from(context.layers);
    const [highestLayerWithOutsidePointerEventsDisabled] = [...context.layersWithOutsidePointerEventsDisabled].slice(-1);
    const highestLayerWithOutsidePointerEventsDisabledIndex = layers.indexOf(highestLayerWithOutsidePointerEventsDisabled);
    const index = node ? layers.indexOf(node) : -1;
    const isBodyPointerEventsDisabled = context.layersWithOutsidePointerEventsDisabled.size > 0;
    const isPointerEventsEnabled = index >= highestLayerWithOutsidePointerEventsDisabledIndex;
    const pointerDownOutside = usePointerDownOutside((event) => {
      const target = event.target;
      const isPointerDownOnBranch = [...context.branches].some((branch) => branch.contains(target));
      if (!isPointerEventsEnabled || isPointerDownOnBranch) return;
      onPointerDownOutside?.(event);
      onInteractOutside?.(event);
      if (!event.defaultPrevented) onDismiss?.();
    }, ownerDocument);
    const focusOutside = useFocusOutside((event) => {
      const target = event.target;
      const isFocusInBranch = [...context.branches].some((branch) => branch.contains(target));
      if (isFocusInBranch) return;
      onFocusOutside?.(event);
      onInteractOutside?.(event);
      if (!event.defaultPrevented) onDismiss?.();
    }, ownerDocument);
    useEscapeKeydown((event) => {
      const isHighestLayer = index === context.layers.size - 1;
      if (!isHighestLayer) return;
      onEscapeKeyDown?.(event);
      if (!event.defaultPrevented && onDismiss) {
        event.preventDefault();
        onDismiss();
      }
    }, ownerDocument);
    React.useEffect(() => {
      if (!node) return;
      if (disableOutsidePointerEvents) {
        if (context.layersWithOutsidePointerEventsDisabled.size === 0) {
          originalBodyPointerEvents = ownerDocument.body.style.pointerEvents;
          ownerDocument.body.style.pointerEvents = "none";
        }
        context.layersWithOutsidePointerEventsDisabled.add(node);
      }
      context.layers.add(node);
      dispatchUpdate();
      return () => {
        if (disableOutsidePointerEvents && context.layersWithOutsidePointerEventsDisabled.size === 1) {
          ownerDocument.body.style.pointerEvents = originalBodyPointerEvents;
        }
      };
    }, [node, ownerDocument, disableOutsidePointerEvents, context]);
    React.useEffect(() => {
      return () => {
        if (!node) return;
        context.layers.delete(node);
        context.layersWithOutsidePointerEventsDisabled.delete(node);
        dispatchUpdate();
      };
    }, [node, context]);
    React.useEffect(() => {
      const handleUpdate = () => force({});
      document.addEventListener(CONTEXT_UPDATE, handleUpdate);
      return () => document.removeEventListener(CONTEXT_UPDATE, handleUpdate);
    }, []);
    return /* @__PURE__ */ jsx(
      Primitive.div,
      {
        ...layerProps,
        ref: composedRefs,
        style: {
          pointerEvents: isBodyPointerEventsDisabled ? isPointerEventsEnabled ? "auto" : "none" : void 0,
          ...props.style
        },
        onFocusCapture: composeEventHandlers(props.onFocusCapture, focusOutside.onFocusCapture),
        onBlurCapture: composeEventHandlers(props.onBlurCapture, focusOutside.onBlurCapture),
        onPointerDownCapture: composeEventHandlers(
          props.onPointerDownCapture,
          pointerDownOutside.onPointerDownCapture
        )
      }
    );
  }
);
DismissableLayer.displayName = DISMISSABLE_LAYER_NAME;
var BRANCH_NAME = "DismissableLayerBranch";
var DismissableLayerBranch = React.forwardRef((props, forwardedRef) => {
  const context = React.useContext(DismissableLayerContext);
  const ref = React.useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, ref);
  React.useEffect(() => {
    const node = ref.current;
    if (node) {
      context.branches.add(node);
      return () => {
        context.branches.delete(node);
      };
    }
  }, [context.branches]);
  return /* @__PURE__ */ jsx(Primitive.div, { ...props, ref: composedRefs });
});
DismissableLayerBranch.displayName = BRANCH_NAME;
function usePointerDownOutside(onPointerDownOutside, ownerDocument = globalThis?.document) {
  const handlePointerDownOutside = useCallbackRef(onPointerDownOutside);
  const isPointerInsideReactTreeRef = React.useRef(false);
  const handleClickRef = React.useRef(() => {
  });
  React.useEffect(() => {
    const handlePointerDown = (event) => {
      if (event.target && !isPointerInsideReactTreeRef.current) {
        let handleAndDispatchPointerDownOutsideEvent2 = function() {
          handleAndDispatchCustomEvent(
            POINTER_DOWN_OUTSIDE,
            handlePointerDownOutside,
            eventDetail,
            { discrete: true }
          );
        };
        const eventDetail = { originalEvent: event };
        if (event.pointerType === "touch") {
          ownerDocument.removeEventListener("click", handleClickRef.current);
          handleClickRef.current = handleAndDispatchPointerDownOutsideEvent2;
          ownerDocument.addEventListener("click", handleClickRef.current, { once: true });
        } else {
          handleAndDispatchPointerDownOutsideEvent2();
        }
      } else {
        ownerDocument.removeEventListener("click", handleClickRef.current);
      }
      isPointerInsideReactTreeRef.current = false;
    };
    const timerId = window.setTimeout(() => {
      ownerDocument.addEventListener("pointerdown", handlePointerDown);
    }, 0);
    return () => {
      window.clearTimeout(timerId);
      ownerDocument.removeEventListener("pointerdown", handlePointerDown);
      ownerDocument.removeEventListener("click", handleClickRef.current);
    };
  }, [ownerDocument, handlePointerDownOutside]);
  return {
    // ensures we check React component tree (not just DOM tree)
    onPointerDownCapture: () => isPointerInsideReactTreeRef.current = true
  };
}
function useFocusOutside(onFocusOutside, ownerDocument = globalThis?.document) {
  const handleFocusOutside = useCallbackRef(onFocusOutside);
  const isFocusInsideReactTreeRef = React.useRef(false);
  React.useEffect(() => {
    const handleFocus = (event) => {
      if (event.target && !isFocusInsideReactTreeRef.current) {
        const eventDetail = { originalEvent: event };
        handleAndDispatchCustomEvent(FOCUS_OUTSIDE, handleFocusOutside, eventDetail, {
          discrete: false
        });
      }
    };
    ownerDocument.addEventListener("focusin", handleFocus);
    return () => ownerDocument.removeEventListener("focusin", handleFocus);
  }, [ownerDocument, handleFocusOutside]);
  return {
    onFocusCapture: () => isFocusInsideReactTreeRef.current = true,
    onBlurCapture: () => isFocusInsideReactTreeRef.current = false
  };
}
function dispatchUpdate() {
  const event = new CustomEvent(CONTEXT_UPDATE);
  document.dispatchEvent(event);
}
function handleAndDispatchCustomEvent(name, handler, detail, { discrete }) {
  const target = detail.originalEvent.target;
  const event = new CustomEvent(name, { bubbles: false, cancelable: true, detail });
  if (handler) target.addEventListener(name, handler, { once: true });
  if (discrete) {
    dispatchDiscreteCustomEvent(target, event);
  } else {
    target.dispatchEvent(event);
  }
}

var AUTOFOCUS_ON_MOUNT = "focusScope.autoFocusOnMount";
var AUTOFOCUS_ON_UNMOUNT = "focusScope.autoFocusOnUnmount";
var EVENT_OPTIONS$1 = { bubbles: false, cancelable: true };
var FOCUS_SCOPE_NAME = "FocusScope";
var FocusScope = React.forwardRef((props, forwardedRef) => {
  const {
    loop = false,
    trapped = false,
    onMountAutoFocus: onMountAutoFocusProp,
    onUnmountAutoFocus: onUnmountAutoFocusProp,
    ...scopeProps
  } = props;
  const [container, setContainer] = React.useState(null);
  const onMountAutoFocus = useCallbackRef(onMountAutoFocusProp);
  const onUnmountAutoFocus = useCallbackRef(onUnmountAutoFocusProp);
  const lastFocusedElementRef = React.useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, (node) => setContainer(node));
  const focusScope = React.useRef({
    paused: false,
    pause() {
      this.paused = true;
    },
    resume() {
      this.paused = false;
    }
  }).current;
  React.useEffect(() => {
    if (trapped) {
      let handleFocusIn2 = function(event) {
        if (focusScope.paused || !container) return;
        const target = event.target;
        if (container.contains(target)) {
          lastFocusedElementRef.current = target;
        } else {
          focus(lastFocusedElementRef.current, { select: true });
        }
      }, handleFocusOut2 = function(event) {
        if (focusScope.paused || !container) return;
        const relatedTarget = event.relatedTarget;
        if (relatedTarget === null) return;
        if (!container.contains(relatedTarget)) {
          focus(lastFocusedElementRef.current, { select: true });
        }
      }, handleMutations2 = function(mutations) {
        const focusedElement = document.activeElement;
        if (focusedElement !== document.body) return;
        for (const mutation of mutations) {
          if (mutation.removedNodes.length > 0) focus(container);
        }
      };
      document.addEventListener("focusin", handleFocusIn2);
      document.addEventListener("focusout", handleFocusOut2);
      const mutationObserver = new MutationObserver(handleMutations2);
      if (container) mutationObserver.observe(container, { childList: true, subtree: true });
      return () => {
        document.removeEventListener("focusin", handleFocusIn2);
        document.removeEventListener("focusout", handleFocusOut2);
        mutationObserver.disconnect();
      };
    }
  }, [trapped, container, focusScope.paused]);
  React.useEffect(() => {
    if (container) {
      focusScopesStack.add(focusScope);
      const previouslyFocusedElement = document.activeElement;
      const hasFocusedCandidate = container.contains(previouslyFocusedElement);
      if (!hasFocusedCandidate) {
        const mountEvent = new CustomEvent(AUTOFOCUS_ON_MOUNT, EVENT_OPTIONS$1);
        container.addEventListener(AUTOFOCUS_ON_MOUNT, onMountAutoFocus);
        container.dispatchEvent(mountEvent);
        if (!mountEvent.defaultPrevented) {
          focusFirst$2(removeLinks(getTabbableCandidates(container)), { select: true });
          if (document.activeElement === previouslyFocusedElement) {
            focus(container);
          }
        }
      }
      return () => {
        container.removeEventListener(AUTOFOCUS_ON_MOUNT, onMountAutoFocus);
        setTimeout(() => {
          const unmountEvent = new CustomEvent(AUTOFOCUS_ON_UNMOUNT, EVENT_OPTIONS$1);
          container.addEventListener(AUTOFOCUS_ON_UNMOUNT, onUnmountAutoFocus);
          container.dispatchEvent(unmountEvent);
          if (!unmountEvent.defaultPrevented) {
            focus(previouslyFocusedElement ?? document.body, { select: true });
          }
          container.removeEventListener(AUTOFOCUS_ON_UNMOUNT, onUnmountAutoFocus);
          focusScopesStack.remove(focusScope);
        }, 0);
      };
    }
  }, [container, onMountAutoFocus, onUnmountAutoFocus, focusScope]);
  const handleKeyDown = React.useCallback(
    (event) => {
      if (!loop && !trapped) return;
      if (focusScope.paused) return;
      const isTabKey = event.key === "Tab" && !event.altKey && !event.ctrlKey && !event.metaKey;
      const focusedElement = document.activeElement;
      if (isTabKey && focusedElement) {
        const container2 = event.currentTarget;
        const [first, last] = getTabbableEdges(container2);
        const hasTabbableElementsInside = first && last;
        if (!hasTabbableElementsInside) {
          if (focusedElement === container2) event.preventDefault();
        } else {
          if (!event.shiftKey && focusedElement === last) {
            event.preventDefault();
            if (loop) focus(first, { select: true });
          } else if (event.shiftKey && focusedElement === first) {
            event.preventDefault();
            if (loop) focus(last, { select: true });
          }
        }
      }
    },
    [loop, trapped, focusScope.paused]
  );
  return /* @__PURE__ */ jsx(Primitive.div, { tabIndex: -1, ...scopeProps, ref: composedRefs, onKeyDown: handleKeyDown });
});
FocusScope.displayName = FOCUS_SCOPE_NAME;
function focusFirst$2(candidates, { select = false } = {}) {
  const previouslyFocusedElement = document.activeElement;
  for (const candidate of candidates) {
    focus(candidate, { select });
    if (document.activeElement !== previouslyFocusedElement) return;
  }
}
function getTabbableEdges(container) {
  const candidates = getTabbableCandidates(container);
  const first = findVisible(candidates, container);
  const last = findVisible(candidates.reverse(), container);
  return [first, last];
}
function getTabbableCandidates(container) {
  const nodes = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) => {
      const isHiddenInput = node.tagName === "INPUT" && node.type === "hidden";
      if (node.disabled || node.hidden || isHiddenInput) return NodeFilter.FILTER_SKIP;
      return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}
function findVisible(elements, container) {
  for (const element of elements) {
    if (!isHidden(element, { upTo: container })) return element;
  }
}
function isHidden(node, { upTo }) {
  if (getComputedStyle(node).visibility === "hidden") return true;
  while (node) {
    if (upTo !== void 0 && node === upTo) return false;
    if (getComputedStyle(node).display === "none") return true;
    node = node.parentElement;
  }
  return false;
}
function isSelectableInput(element) {
  return element instanceof HTMLInputElement && "select" in element;
}
function focus(element, { select = false } = {}) {
  if (element && element.focus) {
    const previouslyFocusedElement = document.activeElement;
    element.focus({ preventScroll: true });
    if (element !== previouslyFocusedElement && isSelectableInput(element) && select)
      element.select();
  }
}
var focusScopesStack = createFocusScopesStack();
function createFocusScopesStack() {
  let stack = [];
  return {
    add(focusScope) {
      const activeFocusScope = stack[0];
      if (focusScope !== activeFocusScope) {
        activeFocusScope?.pause();
      }
      stack = arrayRemove(stack, focusScope);
      stack.unshift(focusScope);
    },
    remove(focusScope) {
      stack = arrayRemove(stack, focusScope);
      stack[0]?.resume();
    }
  };
}
function arrayRemove(array, item) {
  const updatedArray = [...array];
  const index = updatedArray.indexOf(item);
  if (index !== -1) {
    updatedArray.splice(index, 1);
  }
  return updatedArray;
}
function removeLinks(items) {
  return items.filter((item) => item.tagName !== "A");
}

var PORTAL_NAME$3 = "Portal";
var Portal$2 = React.forwardRef((props, forwardedRef) => {
  const { container: containerProp, ...portalProps } = props;
  const [mounted, setMounted] = React.useState(false);
  useLayoutEffect2(() => setMounted(true), []);
  const container = containerProp || mounted && globalThis?.document?.body;
  return container ? ReactDOM__default.createPortal(/* @__PURE__ */ jsx(Primitive.div, { ...portalProps, ref: forwardedRef }), container) : null;
});
Portal$2.displayName = PORTAL_NAME$3;

function useStateMachine$1(initialState, machine) {
  return React.useReducer((state, event) => {
    const nextState = machine[state][event];
    return nextState ?? state;
  }, initialState);
}

// src/presence.tsx
var Presence = (props) => {
  const { present, children } = props;
  const presence = usePresence(present);
  const child = typeof children === "function" ? children({ present: presence.isPresent }) : React.Children.only(children);
  const ref = useComposedRefs(presence.ref, getElementRef$3(child));
  const forceMount = typeof children === "function";
  return forceMount || presence.isPresent ? React.cloneElement(child, { ref }) : null;
};
Presence.displayName = "Presence";
function usePresence(present) {
  const [node, setNode] = React.useState();
  const stylesRef = React.useRef(null);
  const prevPresentRef = React.useRef(present);
  const prevAnimationNameRef = React.useRef("none");
  const initialState = present ? "mounted" : "unmounted";
  const [state, send] = useStateMachine$1(initialState, {
    mounted: {
      UNMOUNT: "unmounted",
      ANIMATION_OUT: "unmountSuspended"
    },
    unmountSuspended: {
      MOUNT: "mounted",
      ANIMATION_END: "unmounted"
    },
    unmounted: {
      MOUNT: "mounted"
    }
  });
  React.useEffect(() => {
    const currentAnimationName = getAnimationName(stylesRef.current);
    prevAnimationNameRef.current = state === "mounted" ? currentAnimationName : "none";
  }, [state]);
  useLayoutEffect2(() => {
    const styles = stylesRef.current;
    const wasPresent = prevPresentRef.current;
    const hasPresentChanged = wasPresent !== present;
    if (hasPresentChanged) {
      const prevAnimationName = prevAnimationNameRef.current;
      const currentAnimationName = getAnimationName(styles);
      if (present) {
        send("MOUNT");
      } else if (currentAnimationName === "none" || styles?.display === "none") {
        send("UNMOUNT");
      } else {
        const isAnimating = prevAnimationName !== currentAnimationName;
        if (wasPresent && isAnimating) {
          send("ANIMATION_OUT");
        } else {
          send("UNMOUNT");
        }
      }
      prevPresentRef.current = present;
    }
  }, [present, send]);
  useLayoutEffect2(() => {
    if (node) {
      let timeoutId;
      const ownerWindow = node.ownerDocument.defaultView ?? window;
      const handleAnimationEnd = (event) => {
        const currentAnimationName = getAnimationName(stylesRef.current);
        const isCurrentAnimation = currentAnimationName.includes(CSS.escape(event.animationName));
        if (event.target === node && isCurrentAnimation) {
          send("ANIMATION_END");
          if (!prevPresentRef.current) {
            const currentFillMode = node.style.animationFillMode;
            node.style.animationFillMode = "forwards";
            timeoutId = ownerWindow.setTimeout(() => {
              if (node.style.animationFillMode === "forwards") {
                node.style.animationFillMode = currentFillMode;
              }
            });
          }
        }
      };
      const handleAnimationStart = (event) => {
        if (event.target === node) {
          prevAnimationNameRef.current = getAnimationName(stylesRef.current);
        }
      };
      node.addEventListener("animationstart", handleAnimationStart);
      node.addEventListener("animationcancel", handleAnimationEnd);
      node.addEventListener("animationend", handleAnimationEnd);
      return () => {
        ownerWindow.clearTimeout(timeoutId);
        node.removeEventListener("animationstart", handleAnimationStart);
        node.removeEventListener("animationcancel", handleAnimationEnd);
        node.removeEventListener("animationend", handleAnimationEnd);
      };
    } else {
      send("ANIMATION_END");
    }
  }, [node, send]);
  return {
    isPresent: ["mounted", "unmountSuspended"].includes(state),
    ref: React.useCallback((node2) => {
      stylesRef.current = node2 ? getComputedStyle(node2) : null;
      setNode(node2);
    }, [])
  };
}
function getAnimationName(styles) {
  return styles?.animationName || "none";
}
function getElementRef$3(element) {
  let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
  let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.ref;
  }
  getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
  mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.props.ref;
  }
  return element.props.ref || element.ref;
}

var count = 0;
function useFocusGuards() {
  React.useEffect(() => {
    const edgeGuards = document.querySelectorAll("[data-radix-focus-guard]");
    document.body.insertAdjacentElement("afterbegin", edgeGuards[0] ?? createFocusGuard());
    document.body.insertAdjacentElement("beforeend", edgeGuards[1] ?? createFocusGuard());
    count++;
    return () => {
      if (count === 1) {
        document.querySelectorAll("[data-radix-focus-guard]").forEach((node) => node.remove());
      }
      count--;
    };
  }, []);
}
function createFocusGuard() {
  const element = document.createElement("span");
  element.setAttribute("data-radix-focus-guard", "");
  element.tabIndex = 0;
  element.style.outline = "none";
  element.style.opacity = "0";
  element.style.position = "fixed";
  element.style.pointerEvents = "none";
  return element;
}

// src/slot.tsx
// @__NO_SIDE_EFFECTS__
function createSlot$2(ownerName) {
  const SlotClone = /* @__PURE__ */ createSlotClone$2(ownerName);
  const Slot2 = React.forwardRef((props, forwardedRef) => {
    const { children, ...slotProps } = props;
    const childrenArray = React.Children.toArray(children);
    const slottable = childrenArray.find(isSlottable$2);
    if (slottable) {
      const newElement = slottable.props.children;
      const newChildren = childrenArray.map((child) => {
        if (child === slottable) {
          if (React.Children.count(newElement) > 1) return React.Children.only(null);
          return React.isValidElement(newElement) ? newElement.props.children : null;
        } else {
          return child;
        }
      });
      return /* @__PURE__ */ jsx(SlotClone, { ...slotProps, ref: forwardedRef, children: React.isValidElement(newElement) ? React.cloneElement(newElement, void 0, newChildren) : null });
    }
    return /* @__PURE__ */ jsx(SlotClone, { ...slotProps, ref: forwardedRef, children });
  });
  Slot2.displayName = `${ownerName}.Slot`;
  return Slot2;
}
// @__NO_SIDE_EFFECTS__
function createSlotClone$2(ownerName) {
  const SlotClone = React.forwardRef((props, forwardedRef) => {
    const { children, ...slotProps } = props;
    if (React.isValidElement(children)) {
      const childrenRef = getElementRef$2(children);
      const props2 = mergeProps$2(slotProps, children.props);
      if (children.type !== React.Fragment) {
        props2.ref = forwardedRef ? composeRefs(forwardedRef, childrenRef) : childrenRef;
      }
      return React.cloneElement(children, props2);
    }
    return React.Children.count(children) > 1 ? React.Children.only(null) : null;
  });
  SlotClone.displayName = `${ownerName}.SlotClone`;
  return SlotClone;
}
var SLOTTABLE_IDENTIFIER$2 = Symbol("radix.slottable");
function isSlottable$2(child) {
  return React.isValidElement(child) && typeof child.type === "function" && "__radixId" in child.type && child.type.__radixId === SLOTTABLE_IDENTIFIER$2;
}
function mergeProps$2(slotProps, childProps) {
  const overrideProps = { ...childProps };
  for (const propName in childProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];
    const isHandler = /^on[A-Z]/.test(propName);
    if (isHandler) {
      if (slotPropValue && childPropValue) {
        overrideProps[propName] = (...args) => {
          const result = childPropValue(...args);
          slotPropValue(...args);
          return result;
        };
      } else if (slotPropValue) {
        overrideProps[propName] = slotPropValue;
      }
    } else if (propName === "style") {
      overrideProps[propName] = { ...slotPropValue, ...childPropValue };
    } else if (propName === "className") {
      overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(" ");
    }
  }
  return { ...slotProps, ...overrideProps };
}
function getElementRef$2(element) {
  let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
  let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.ref;
  }
  getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
  mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.props.ref;
  }
  return element.props.ref || element.ref;
}

var DIALOG_NAME = "Dialog";
var [createDialogContext] = createContextScope(DIALOG_NAME);
var [DialogProvider, useDialogContext] = createDialogContext(DIALOG_NAME);
var Dialog$1 = (props) => {
  const {
    __scopeDialog,
    children,
    open: openProp,
    defaultOpen,
    onOpenChange,
    modal = true
  } = props;
  const triggerRef = React.useRef(null);
  const contentRef = React.useRef(null);
  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
    caller: DIALOG_NAME
  });
  return /* @__PURE__ */ jsx(
    DialogProvider,
    {
      scope: __scopeDialog,
      triggerRef,
      contentRef,
      contentId: useId(),
      titleId: useId(),
      descriptionId: useId(),
      open,
      onOpenChange: setOpen,
      onOpenToggle: React.useCallback(() => setOpen((prevOpen) => !prevOpen), [setOpen]),
      modal,
      children
    }
  );
};
Dialog$1.displayName = DIALOG_NAME;
var TRIGGER_NAME$1 = "DialogTrigger";
var DialogTrigger = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...triggerProps } = props;
    const context = useDialogContext(TRIGGER_NAME$1, __scopeDialog);
    const composedTriggerRef = useComposedRefs(forwardedRef, context.triggerRef);
    return /* @__PURE__ */ jsx(
      Primitive.button,
      {
        type: "button",
        "aria-haspopup": "dialog",
        "aria-expanded": context.open,
        "aria-controls": context.contentId,
        "data-state": getState(context.open),
        ...triggerProps,
        ref: composedTriggerRef,
        onClick: composeEventHandlers(props.onClick, context.onOpenToggle)
      }
    );
  }
);
DialogTrigger.displayName = TRIGGER_NAME$1;
var PORTAL_NAME$2 = "DialogPortal";
var [PortalProvider$1, usePortalContext$1] = createDialogContext(PORTAL_NAME$2, {
  forceMount: void 0
});
var DialogPortal$1 = (props) => {
  const { __scopeDialog, forceMount, children, container } = props;
  const context = useDialogContext(PORTAL_NAME$2, __scopeDialog);
  return /* @__PURE__ */ jsx(PortalProvider$1, { scope: __scopeDialog, forceMount, children: React.Children.map(children, (child) => /* @__PURE__ */ jsx(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsx(Portal$2, { asChild: true, container, children: child }) })) });
};
DialogPortal$1.displayName = PORTAL_NAME$2;
var OVERLAY_NAME = "DialogOverlay";
var DialogOverlay$1 = React.forwardRef(
  (props, forwardedRef) => {
    const portalContext = usePortalContext$1(OVERLAY_NAME, props.__scopeDialog);
    const { forceMount = portalContext.forceMount, ...overlayProps } = props;
    const context = useDialogContext(OVERLAY_NAME, props.__scopeDialog);
    return context.modal ? /* @__PURE__ */ jsx(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsx(DialogOverlayImpl, { ...overlayProps, ref: forwardedRef }) }) : null;
  }
);
DialogOverlay$1.displayName = OVERLAY_NAME;
var Slot$1 = createSlot$2("DialogOverlay.RemoveScroll");
var DialogOverlayImpl = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...overlayProps } = props;
    const context = useDialogContext(OVERLAY_NAME, __scopeDialog);
    return (
      // Make sure `Content` is scrollable even when it doesn't live inside `RemoveScroll`
      // ie. when `Overlay` and `Content` are siblings
      /* @__PURE__ */ jsx(RemoveScroll, { as: Slot$1, allowPinchZoom: true, shards: [context.contentRef], children: /* @__PURE__ */ jsx(
        Primitive.div,
        {
          "data-state": getState(context.open),
          ...overlayProps,
          ref: forwardedRef,
          style: { pointerEvents: "auto", ...overlayProps.style }
        }
      ) })
    );
  }
);
var CONTENT_NAME$3 = "DialogContent";
var DialogContent$1 = React.forwardRef(
  (props, forwardedRef) => {
    const portalContext = usePortalContext$1(CONTENT_NAME$3, props.__scopeDialog);
    const { forceMount = portalContext.forceMount, ...contentProps } = props;
    const context = useDialogContext(CONTENT_NAME$3, props.__scopeDialog);
    return /* @__PURE__ */ jsx(Presence, { present: forceMount || context.open, children: context.modal ? /* @__PURE__ */ jsx(DialogContentModal, { ...contentProps, ref: forwardedRef }) : /* @__PURE__ */ jsx(DialogContentNonModal, { ...contentProps, ref: forwardedRef }) });
  }
);
DialogContent$1.displayName = CONTENT_NAME$3;
var DialogContentModal = React.forwardRef(
  (props, forwardedRef) => {
    const context = useDialogContext(CONTENT_NAME$3, props.__scopeDialog);
    const contentRef = React.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, context.contentRef, contentRef);
    React.useEffect(() => {
      const content = contentRef.current;
      if (content) return hideOthers(content);
    }, []);
    return /* @__PURE__ */ jsx(
      DialogContentImpl,
      {
        ...props,
        ref: composedRefs,
        trapFocus: context.open,
        disableOutsidePointerEvents: true,
        onCloseAutoFocus: composeEventHandlers(props.onCloseAutoFocus, (event) => {
          event.preventDefault();
          context.triggerRef.current?.focus();
        }),
        onPointerDownOutside: composeEventHandlers(props.onPointerDownOutside, (event) => {
          const originalEvent = event.detail.originalEvent;
          const ctrlLeftClick = originalEvent.button === 0 && originalEvent.ctrlKey === true;
          const isRightClick = originalEvent.button === 2 || ctrlLeftClick;
          if (isRightClick) event.preventDefault();
        }),
        onFocusOutside: composeEventHandlers(
          props.onFocusOutside,
          (event) => event.preventDefault()
        )
      }
    );
  }
);
var DialogContentNonModal = React.forwardRef(
  (props, forwardedRef) => {
    const context = useDialogContext(CONTENT_NAME$3, props.__scopeDialog);
    const hasInteractedOutsideRef = React.useRef(false);
    const hasPointerDownOutsideRef = React.useRef(false);
    return /* @__PURE__ */ jsx(
      DialogContentImpl,
      {
        ...props,
        ref: forwardedRef,
        trapFocus: false,
        disableOutsidePointerEvents: false,
        onCloseAutoFocus: (event) => {
          props.onCloseAutoFocus?.(event);
          if (!event.defaultPrevented) {
            if (!hasInteractedOutsideRef.current) context.triggerRef.current?.focus();
            event.preventDefault();
          }
          hasInteractedOutsideRef.current = false;
          hasPointerDownOutsideRef.current = false;
        },
        onInteractOutside: (event) => {
          props.onInteractOutside?.(event);
          if (!event.defaultPrevented) {
            hasInteractedOutsideRef.current = true;
            if (event.detail.originalEvent.type === "pointerdown") {
              hasPointerDownOutsideRef.current = true;
            }
          }
          const target = event.target;
          const targetIsTrigger = context.triggerRef.current?.contains(target);
          if (targetIsTrigger) event.preventDefault();
          if (event.detail.originalEvent.type === "focusin" && hasPointerDownOutsideRef.current) {
            event.preventDefault();
          }
        }
      }
    );
  }
);
var DialogContentImpl = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, trapFocus, onOpenAutoFocus, onCloseAutoFocus, ...contentProps } = props;
    const context = useDialogContext(CONTENT_NAME$3, __scopeDialog);
    const contentRef = React.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, contentRef);
    useFocusGuards();
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        FocusScope,
        {
          asChild: true,
          loop: true,
          trapped: trapFocus,
          onMountAutoFocus: onOpenAutoFocus,
          onUnmountAutoFocus: onCloseAutoFocus,
          children: /* @__PURE__ */ jsx(
            DismissableLayer,
            {
              role: "dialog",
              id: context.contentId,
              "aria-describedby": context.descriptionId,
              "aria-labelledby": context.titleId,
              "data-state": getState(context.open),
              ...contentProps,
              ref: composedRefs,
              onDismiss: () => context.onOpenChange(false)
            }
          )
        }
      ),
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(TitleWarning, { titleId: context.titleId }),
        /* @__PURE__ */ jsx(DescriptionWarning, { contentRef, descriptionId: context.descriptionId })
      ] })
    ] });
  }
);
var TITLE_NAME = "DialogTitle";
var DialogTitle$1 = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...titleProps } = props;
    const context = useDialogContext(TITLE_NAME, __scopeDialog);
    return /* @__PURE__ */ jsx(Primitive.h2, { id: context.titleId, ...titleProps, ref: forwardedRef });
  }
);
DialogTitle$1.displayName = TITLE_NAME;
var DESCRIPTION_NAME = "DialogDescription";
var DialogDescription$1 = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...descriptionProps } = props;
    const context = useDialogContext(DESCRIPTION_NAME, __scopeDialog);
    return /* @__PURE__ */ jsx(Primitive.p, { id: context.descriptionId, ...descriptionProps, ref: forwardedRef });
  }
);
DialogDescription$1.displayName = DESCRIPTION_NAME;
var CLOSE_NAME = "DialogClose";
var DialogClose = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...closeProps } = props;
    const context = useDialogContext(CLOSE_NAME, __scopeDialog);
    return /* @__PURE__ */ jsx(
      Primitive.button,
      {
        type: "button",
        ...closeProps,
        ref: forwardedRef,
        onClick: composeEventHandlers(props.onClick, () => context.onOpenChange(false))
      }
    );
  }
);
DialogClose.displayName = CLOSE_NAME;
function getState(open) {
  return open ? "open" : "closed";
}
var TITLE_WARNING_NAME = "DialogTitleWarning";
var [WarningProvider, useWarningContext] = createContext2(TITLE_WARNING_NAME, {
  contentName: CONTENT_NAME$3,
  titleName: TITLE_NAME,
  docsSlug: "dialog"
});
var TitleWarning = ({ titleId }) => {
  const titleWarningContext = useWarningContext(TITLE_WARNING_NAME);
  const MESSAGE = `\`${titleWarningContext.contentName}\` requires a \`${titleWarningContext.titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${titleWarningContext.titleName}\`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/${titleWarningContext.docsSlug}`;
  React.useEffect(() => {
    if (titleId) {
      const hasTitle = document.getElementById(titleId);
      if (!hasTitle) console.error(MESSAGE);
    }
  }, [MESSAGE, titleId]);
  return null;
};
var DESCRIPTION_WARNING_NAME = "DialogDescriptionWarning";
var DescriptionWarning = ({ contentRef, descriptionId }) => {
  const descriptionWarningContext = useWarningContext(DESCRIPTION_WARNING_NAME);
  const MESSAGE = `Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${descriptionWarningContext.contentName}}.`;
  React.useEffect(() => {
    const describedById = contentRef.current?.getAttribute("aria-describedby");
    if (descriptionId && describedById) {
      const hasDescription = document.getElementById(descriptionId);
      if (!hasDescription) console.warn(MESSAGE);
    }
  }, [MESSAGE, contentRef, descriptionId]);
  return null;
};
var Root$3 = Dialog$1;
var Portal$1 = DialogPortal$1;
var Overlay = DialogOverlay$1;
var Content$1 = DialogContent$1;
var Title = DialogTitle$1;
var Description = DialogDescription$1;
var Close = DialogClose;

const Dialog = Root$3;
const DialogPortal = Portal$1;
const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = Overlay.displayName;
const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxs(
    Content$1,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxs(Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = Content$1.displayName;
const DialogHeader = ({
  className,
  ...props
}) => /* @__PURE__ */ jsx(
  "div",
  {
    className: cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    ),
    ...props
  }
);
DialogHeader.displayName = "DialogHeader";
const DialogFooter = ({
  className,
  ...props
}) => /* @__PURE__ */ jsx(
  "div",
  {
    className: cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    ),
    ...props
  }
);
DialogFooter.displayName = "DialogFooter";
const DialogTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  Title,
  {
    ref,
    className: cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    ),
    ...props
  }
));
DialogTitle.displayName = Title.displayName;
const DialogDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = Description.displayName;

// packages/react/direction/src/direction.tsx
var DirectionContext = React.createContext(void 0);
function useDirection(localDir) {
  const globalDir = React.useContext(DirectionContext);
  return localDir || globalDir || "ltr";
}

function useStateMachine(initialState, machine) {
  return React.useReducer((state, event) => {
    const nextState = machine[state][event];
    return nextState ?? state;
  }, initialState);
}
var SCROLL_AREA_NAME = "ScrollArea";
var [createScrollAreaContext] = createContextScope(SCROLL_AREA_NAME);
var [ScrollAreaProvider, useScrollAreaContext] = createScrollAreaContext(SCROLL_AREA_NAME);
var ScrollArea$1 = React.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeScrollArea,
      type = "hover",
      dir,
      scrollHideDelay = 600,
      ...scrollAreaProps
    } = props;
    const [scrollArea, setScrollArea] = React.useState(null);
    const [viewport, setViewport] = React.useState(null);
    const [content, setContent] = React.useState(null);
    const [scrollbarX, setScrollbarX] = React.useState(null);
    const [scrollbarY, setScrollbarY] = React.useState(null);
    const [cornerWidth, setCornerWidth] = React.useState(0);
    const [cornerHeight, setCornerHeight] = React.useState(0);
    const [scrollbarXEnabled, setScrollbarXEnabled] = React.useState(false);
    const [scrollbarYEnabled, setScrollbarYEnabled] = React.useState(false);
    const composedRefs = useComposedRefs(forwardedRef, (node) => setScrollArea(node));
    const direction = useDirection(dir);
    return /* @__PURE__ */ jsx(
      ScrollAreaProvider,
      {
        scope: __scopeScrollArea,
        type,
        dir: direction,
        scrollHideDelay,
        scrollArea,
        viewport,
        onViewportChange: setViewport,
        content,
        onContentChange: setContent,
        scrollbarX,
        onScrollbarXChange: setScrollbarX,
        scrollbarXEnabled,
        onScrollbarXEnabledChange: setScrollbarXEnabled,
        scrollbarY,
        onScrollbarYChange: setScrollbarY,
        scrollbarYEnabled,
        onScrollbarYEnabledChange: setScrollbarYEnabled,
        onCornerWidthChange: setCornerWidth,
        onCornerHeightChange: setCornerHeight,
        children: /* @__PURE__ */ jsx(
          Primitive.div,
          {
            dir: direction,
            ...scrollAreaProps,
            ref: composedRefs,
            style: {
              position: "relative",
              // Pass corner sizes as CSS vars to reduce re-renders of context consumers
              ["--radix-scroll-area-corner-width"]: cornerWidth + "px",
              ["--radix-scroll-area-corner-height"]: cornerHeight + "px",
              ...props.style
            }
          }
        )
      }
    );
  }
);
ScrollArea$1.displayName = SCROLL_AREA_NAME;
var VIEWPORT_NAME = "ScrollAreaViewport";
var ScrollAreaViewport = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeScrollArea, children, nonce, ...viewportProps } = props;
    const context = useScrollAreaContext(VIEWPORT_NAME, __scopeScrollArea);
    const ref = React.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref, context.onViewportChange);
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        "style",
        {
          dangerouslySetInnerHTML: {
            __html: `[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}`
          },
          nonce
        }
      ),
      /* @__PURE__ */ jsx(
        Primitive.div,
        {
          "data-radix-scroll-area-viewport": "",
          ...viewportProps,
          ref: composedRefs,
          style: {
            /**
             * We don't support `visible` because the intention is to have at least one scrollbar
             * if this component is used and `visible` will behave like `auto` in that case
             * https://developer.mozilla.org/en-US/docs/Web/CSS/overflow#description
             *
             * We don't handle `auto` because the intention is for the native implementation
             * to be hidden if using this component. We just want to ensure the node is scrollable
             * so could have used either `scroll` or `auto` here. We picked `scroll` to prevent
             * the browser from having to work out whether to render native scrollbars or not,
             * we tell it to with the intention of hiding them in CSS.
             */
            overflowX: context.scrollbarXEnabled ? "scroll" : "hidden",
            overflowY: context.scrollbarYEnabled ? "scroll" : "hidden",
            ...props.style
          },
          children: /* @__PURE__ */ jsx("div", { ref: context.onContentChange, style: { minWidth: "100%", display: "table" }, children })
        }
      )
    ] });
  }
);
ScrollAreaViewport.displayName = VIEWPORT_NAME;
var SCROLLBAR_NAME = "ScrollAreaScrollbar";
var ScrollAreaScrollbar = React.forwardRef(
  (props, forwardedRef) => {
    const { forceMount, ...scrollbarProps } = props;
    const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
    const { onScrollbarXEnabledChange, onScrollbarYEnabledChange } = context;
    const isHorizontal = props.orientation === "horizontal";
    React.useEffect(() => {
      isHorizontal ? onScrollbarXEnabledChange(true) : onScrollbarYEnabledChange(true);
      return () => {
        isHorizontal ? onScrollbarXEnabledChange(false) : onScrollbarYEnabledChange(false);
      };
    }, [isHorizontal, onScrollbarXEnabledChange, onScrollbarYEnabledChange]);
    return context.type === "hover" ? /* @__PURE__ */ jsx(ScrollAreaScrollbarHover, { ...scrollbarProps, ref: forwardedRef, forceMount }) : context.type === "scroll" ? /* @__PURE__ */ jsx(ScrollAreaScrollbarScroll, { ...scrollbarProps, ref: forwardedRef, forceMount }) : context.type === "auto" ? /* @__PURE__ */ jsx(ScrollAreaScrollbarAuto, { ...scrollbarProps, ref: forwardedRef, forceMount }) : context.type === "always" ? /* @__PURE__ */ jsx(ScrollAreaScrollbarVisible, { ...scrollbarProps, ref: forwardedRef }) : null;
  }
);
ScrollAreaScrollbar.displayName = SCROLLBAR_NAME;
var ScrollAreaScrollbarHover = React.forwardRef((props, forwardedRef) => {
  const { forceMount, ...scrollbarProps } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const scrollArea = context.scrollArea;
    let hideTimer = 0;
    if (scrollArea) {
      const handlePointerEnter = () => {
        window.clearTimeout(hideTimer);
        setVisible(true);
      };
      const handlePointerLeave = () => {
        hideTimer = window.setTimeout(() => setVisible(false), context.scrollHideDelay);
      };
      scrollArea.addEventListener("pointerenter", handlePointerEnter);
      scrollArea.addEventListener("pointerleave", handlePointerLeave);
      return () => {
        window.clearTimeout(hideTimer);
        scrollArea.removeEventListener("pointerenter", handlePointerEnter);
        scrollArea.removeEventListener("pointerleave", handlePointerLeave);
      };
    }
  }, [context.scrollArea, context.scrollHideDelay]);
  return /* @__PURE__ */ jsx(Presence, { present: forceMount || visible, children: /* @__PURE__ */ jsx(
    ScrollAreaScrollbarAuto,
    {
      "data-state": visible ? "visible" : "hidden",
      ...scrollbarProps,
      ref: forwardedRef
    }
  ) });
});
var ScrollAreaScrollbarScroll = React.forwardRef((props, forwardedRef) => {
  const { forceMount, ...scrollbarProps } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const isHorizontal = props.orientation === "horizontal";
  const debounceScrollEnd = useDebounceCallback(() => send("SCROLL_END"), 100);
  const [state, send] = useStateMachine("hidden", {
    hidden: {
      SCROLL: "scrolling"
    },
    scrolling: {
      SCROLL_END: "idle",
      POINTER_ENTER: "interacting"
    },
    interacting: {
      SCROLL: "interacting",
      POINTER_LEAVE: "idle"
    },
    idle: {
      HIDE: "hidden",
      SCROLL: "scrolling",
      POINTER_ENTER: "interacting"
    }
  });
  React.useEffect(() => {
    if (state === "idle") {
      const hideTimer = window.setTimeout(() => send("HIDE"), context.scrollHideDelay);
      return () => window.clearTimeout(hideTimer);
    }
  }, [state, context.scrollHideDelay, send]);
  React.useEffect(() => {
    const viewport = context.viewport;
    const scrollDirection = isHorizontal ? "scrollLeft" : "scrollTop";
    if (viewport) {
      let prevScrollPos = viewport[scrollDirection];
      const handleScroll = () => {
        const scrollPos = viewport[scrollDirection];
        const hasScrollInDirectionChanged = prevScrollPos !== scrollPos;
        if (hasScrollInDirectionChanged) {
          send("SCROLL");
          debounceScrollEnd();
        }
        prevScrollPos = scrollPos;
      };
      viewport.addEventListener("scroll", handleScroll);
      return () => viewport.removeEventListener("scroll", handleScroll);
    }
  }, [context.viewport, isHorizontal, send, debounceScrollEnd]);
  return /* @__PURE__ */ jsx(Presence, { present: forceMount || state !== "hidden", children: /* @__PURE__ */ jsx(
    ScrollAreaScrollbarVisible,
    {
      "data-state": state === "hidden" ? "hidden" : "visible",
      ...scrollbarProps,
      ref: forwardedRef,
      onPointerEnter: composeEventHandlers(props.onPointerEnter, () => send("POINTER_ENTER")),
      onPointerLeave: composeEventHandlers(props.onPointerLeave, () => send("POINTER_LEAVE"))
    }
  ) });
});
var ScrollAreaScrollbarAuto = React.forwardRef((props, forwardedRef) => {
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const { forceMount, ...scrollbarProps } = props;
  const [visible, setVisible] = React.useState(false);
  const isHorizontal = props.orientation === "horizontal";
  const handleResize = useDebounceCallback(() => {
    if (context.viewport) {
      const isOverflowX = context.viewport.offsetWidth < context.viewport.scrollWidth;
      const isOverflowY = context.viewport.offsetHeight < context.viewport.scrollHeight;
      setVisible(isHorizontal ? isOverflowX : isOverflowY);
    }
  }, 10);
  useResizeObserver(context.viewport, handleResize);
  useResizeObserver(context.content, handleResize);
  return /* @__PURE__ */ jsx(Presence, { present: forceMount || visible, children: /* @__PURE__ */ jsx(
    ScrollAreaScrollbarVisible,
    {
      "data-state": visible ? "visible" : "hidden",
      ...scrollbarProps,
      ref: forwardedRef
    }
  ) });
});
var ScrollAreaScrollbarVisible = React.forwardRef((props, forwardedRef) => {
  const { orientation = "vertical", ...scrollbarProps } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const thumbRef = React.useRef(null);
  const pointerOffsetRef = React.useRef(0);
  const [sizes, setSizes] = React.useState({
    content: 0,
    viewport: 0,
    scrollbar: { size: 0, paddingStart: 0, paddingEnd: 0 }
  });
  const thumbRatio = getThumbRatio(sizes.viewport, sizes.content);
  const commonProps = {
    ...scrollbarProps,
    sizes,
    onSizesChange: setSizes,
    hasThumb: Boolean(thumbRatio > 0 && thumbRatio < 1),
    onThumbChange: (thumb) => thumbRef.current = thumb,
    onThumbPointerUp: () => pointerOffsetRef.current = 0,
    onThumbPointerDown: (pointerPos) => pointerOffsetRef.current = pointerPos
  };
  function getScrollPosition(pointerPos, dir) {
    return getScrollPositionFromPointer(pointerPos, pointerOffsetRef.current, sizes, dir);
  }
  if (orientation === "horizontal") {
    return /* @__PURE__ */ jsx(
      ScrollAreaScrollbarX,
      {
        ...commonProps,
        ref: forwardedRef,
        onThumbPositionChange: () => {
          if (context.viewport && thumbRef.current) {
            const scrollPos = context.viewport.scrollLeft;
            const offset = getThumbOffsetFromScroll(scrollPos, sizes, context.dir);
            thumbRef.current.style.transform = `translate3d(${offset}px, 0, 0)`;
          }
        },
        onWheelScroll: (scrollPos) => {
          if (context.viewport) context.viewport.scrollLeft = scrollPos;
        },
        onDragScroll: (pointerPos) => {
          if (context.viewport) {
            context.viewport.scrollLeft = getScrollPosition(pointerPos, context.dir);
          }
        }
      }
    );
  }
  if (orientation === "vertical") {
    return /* @__PURE__ */ jsx(
      ScrollAreaScrollbarY,
      {
        ...commonProps,
        ref: forwardedRef,
        onThumbPositionChange: () => {
          if (context.viewport && thumbRef.current) {
            const scrollPos = context.viewport.scrollTop;
            const offset = getThumbOffsetFromScroll(scrollPos, sizes);
            thumbRef.current.style.transform = `translate3d(0, ${offset}px, 0)`;
          }
        },
        onWheelScroll: (scrollPos) => {
          if (context.viewport) context.viewport.scrollTop = scrollPos;
        },
        onDragScroll: (pointerPos) => {
          if (context.viewport) context.viewport.scrollTop = getScrollPosition(pointerPos);
        }
      }
    );
  }
  return null;
});
var ScrollAreaScrollbarX = React.forwardRef((props, forwardedRef) => {
  const { sizes, onSizesChange, ...scrollbarProps } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const [computedStyle, setComputedStyle] = React.useState();
  const ref = React.useRef(null);
  const composeRefs = useComposedRefs(forwardedRef, ref, context.onScrollbarXChange);
  React.useEffect(() => {
    if (ref.current) setComputedStyle(getComputedStyle(ref.current));
  }, [ref]);
  return /* @__PURE__ */ jsx(
    ScrollAreaScrollbarImpl,
    {
      "data-orientation": "horizontal",
      ...scrollbarProps,
      ref: composeRefs,
      sizes,
      style: {
        bottom: 0,
        left: context.dir === "rtl" ? "var(--radix-scroll-area-corner-width)" : 0,
        right: context.dir === "ltr" ? "var(--radix-scroll-area-corner-width)" : 0,
        ["--radix-scroll-area-thumb-width"]: getThumbSize(sizes) + "px",
        ...props.style
      },
      onThumbPointerDown: (pointerPos) => props.onThumbPointerDown(pointerPos.x),
      onDragScroll: (pointerPos) => props.onDragScroll(pointerPos.x),
      onWheelScroll: (event, maxScrollPos) => {
        if (context.viewport) {
          const scrollPos = context.viewport.scrollLeft + event.deltaX;
          props.onWheelScroll(scrollPos);
          if (isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos)) {
            event.preventDefault();
          }
        }
      },
      onResize: () => {
        if (ref.current && context.viewport && computedStyle) {
          onSizesChange({
            content: context.viewport.scrollWidth,
            viewport: context.viewport.offsetWidth,
            scrollbar: {
              size: ref.current.clientWidth,
              paddingStart: toInt(computedStyle.paddingLeft),
              paddingEnd: toInt(computedStyle.paddingRight)
            }
          });
        }
      }
    }
  );
});
var ScrollAreaScrollbarY = React.forwardRef((props, forwardedRef) => {
  const { sizes, onSizesChange, ...scrollbarProps } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const [computedStyle, setComputedStyle] = React.useState();
  const ref = React.useRef(null);
  const composeRefs = useComposedRefs(forwardedRef, ref, context.onScrollbarYChange);
  React.useEffect(() => {
    if (ref.current) setComputedStyle(getComputedStyle(ref.current));
  }, [ref]);
  return /* @__PURE__ */ jsx(
    ScrollAreaScrollbarImpl,
    {
      "data-orientation": "vertical",
      ...scrollbarProps,
      ref: composeRefs,
      sizes,
      style: {
        top: 0,
        right: context.dir === "ltr" ? 0 : void 0,
        left: context.dir === "rtl" ? 0 : void 0,
        bottom: "var(--radix-scroll-area-corner-height)",
        ["--radix-scroll-area-thumb-height"]: getThumbSize(sizes) + "px",
        ...props.style
      },
      onThumbPointerDown: (pointerPos) => props.onThumbPointerDown(pointerPos.y),
      onDragScroll: (pointerPos) => props.onDragScroll(pointerPos.y),
      onWheelScroll: (event, maxScrollPos) => {
        if (context.viewport) {
          const scrollPos = context.viewport.scrollTop + event.deltaY;
          props.onWheelScroll(scrollPos);
          if (isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos)) {
            event.preventDefault();
          }
        }
      },
      onResize: () => {
        if (ref.current && context.viewport && computedStyle) {
          onSizesChange({
            content: context.viewport.scrollHeight,
            viewport: context.viewport.offsetHeight,
            scrollbar: {
              size: ref.current.clientHeight,
              paddingStart: toInt(computedStyle.paddingTop),
              paddingEnd: toInt(computedStyle.paddingBottom)
            }
          });
        }
      }
    }
  );
});
var [ScrollbarProvider, useScrollbarContext] = createScrollAreaContext(SCROLLBAR_NAME);
var ScrollAreaScrollbarImpl = React.forwardRef((props, forwardedRef) => {
  const {
    __scopeScrollArea,
    sizes,
    hasThumb,
    onThumbChange,
    onThumbPointerUp,
    onThumbPointerDown,
    onThumbPositionChange,
    onDragScroll,
    onWheelScroll,
    onResize,
    ...scrollbarProps
  } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, __scopeScrollArea);
  const [scrollbar, setScrollbar] = React.useState(null);
  const composeRefs = useComposedRefs(forwardedRef, (node) => setScrollbar(node));
  const rectRef = React.useRef(null);
  const prevWebkitUserSelectRef = React.useRef("");
  const viewport = context.viewport;
  const maxScrollPos = sizes.content - sizes.viewport;
  const handleWheelScroll = useCallbackRef(onWheelScroll);
  const handleThumbPositionChange = useCallbackRef(onThumbPositionChange);
  const handleResize = useDebounceCallback(onResize, 10);
  function handleDragScroll(event) {
    if (rectRef.current) {
      const x = event.clientX - rectRef.current.left;
      const y = event.clientY - rectRef.current.top;
      onDragScroll({ x, y });
    }
  }
  React.useEffect(() => {
    const handleWheel = (event) => {
      const element = event.target;
      const isScrollbarWheel = scrollbar?.contains(element);
      if (isScrollbarWheel) handleWheelScroll(event, maxScrollPos);
    };
    document.addEventListener("wheel", handleWheel, { passive: false });
    return () => document.removeEventListener("wheel", handleWheel, { passive: false });
  }, [viewport, scrollbar, maxScrollPos, handleWheelScroll]);
  React.useEffect(handleThumbPositionChange, [sizes, handleThumbPositionChange]);
  useResizeObserver(scrollbar, handleResize);
  useResizeObserver(context.content, handleResize);
  return /* @__PURE__ */ jsx(
    ScrollbarProvider,
    {
      scope: __scopeScrollArea,
      scrollbar,
      hasThumb,
      onThumbChange: useCallbackRef(onThumbChange),
      onThumbPointerUp: useCallbackRef(onThumbPointerUp),
      onThumbPositionChange: handleThumbPositionChange,
      onThumbPointerDown: useCallbackRef(onThumbPointerDown),
      children: /* @__PURE__ */ jsx(
        Primitive.div,
        {
          ...scrollbarProps,
          ref: composeRefs,
          style: { position: "absolute", ...scrollbarProps.style },
          onPointerDown: composeEventHandlers(props.onPointerDown, (event) => {
            const mainPointer = 0;
            if (event.button === mainPointer) {
              const element = event.target;
              element.setPointerCapture(event.pointerId);
              rectRef.current = scrollbar.getBoundingClientRect();
              prevWebkitUserSelectRef.current = document.body.style.webkitUserSelect;
              document.body.style.webkitUserSelect = "none";
              if (context.viewport) context.viewport.style.scrollBehavior = "auto";
              handleDragScroll(event);
            }
          }),
          onPointerMove: composeEventHandlers(props.onPointerMove, handleDragScroll),
          onPointerUp: composeEventHandlers(props.onPointerUp, (event) => {
            const element = event.target;
            if (element.hasPointerCapture(event.pointerId)) {
              element.releasePointerCapture(event.pointerId);
            }
            document.body.style.webkitUserSelect = prevWebkitUserSelectRef.current;
            if (context.viewport) context.viewport.style.scrollBehavior = "";
            rectRef.current = null;
          })
        }
      )
    }
  );
});
var THUMB_NAME = "ScrollAreaThumb";
var ScrollAreaThumb = React.forwardRef(
  (props, forwardedRef) => {
    const { forceMount, ...thumbProps } = props;
    const scrollbarContext = useScrollbarContext(THUMB_NAME, props.__scopeScrollArea);
    return /* @__PURE__ */ jsx(Presence, { present: forceMount || scrollbarContext.hasThumb, children: /* @__PURE__ */ jsx(ScrollAreaThumbImpl, { ref: forwardedRef, ...thumbProps }) });
  }
);
var ScrollAreaThumbImpl = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeScrollArea, style, ...thumbProps } = props;
    const scrollAreaContext = useScrollAreaContext(THUMB_NAME, __scopeScrollArea);
    const scrollbarContext = useScrollbarContext(THUMB_NAME, __scopeScrollArea);
    const { onThumbPositionChange } = scrollbarContext;
    const composedRef = useComposedRefs(
      forwardedRef,
      (node) => scrollbarContext.onThumbChange(node)
    );
    const removeUnlinkedScrollListenerRef = React.useRef(void 0);
    const debounceScrollEnd = useDebounceCallback(() => {
      if (removeUnlinkedScrollListenerRef.current) {
        removeUnlinkedScrollListenerRef.current();
        removeUnlinkedScrollListenerRef.current = void 0;
      }
    }, 100);
    React.useEffect(() => {
      const viewport = scrollAreaContext.viewport;
      if (viewport) {
        const handleScroll = () => {
          debounceScrollEnd();
          if (!removeUnlinkedScrollListenerRef.current) {
            const listener = addUnlinkedScrollListener(viewport, onThumbPositionChange);
            removeUnlinkedScrollListenerRef.current = listener;
            onThumbPositionChange();
          }
        };
        onThumbPositionChange();
        viewport.addEventListener("scroll", handleScroll);
        return () => viewport.removeEventListener("scroll", handleScroll);
      }
    }, [scrollAreaContext.viewport, debounceScrollEnd, onThumbPositionChange]);
    return /* @__PURE__ */ jsx(
      Primitive.div,
      {
        "data-state": scrollbarContext.hasThumb ? "visible" : "hidden",
        ...thumbProps,
        ref: composedRef,
        style: {
          width: "var(--radix-scroll-area-thumb-width)",
          height: "var(--radix-scroll-area-thumb-height)",
          ...style
        },
        onPointerDownCapture: composeEventHandlers(props.onPointerDownCapture, (event) => {
          const thumb = event.target;
          const thumbRect = thumb.getBoundingClientRect();
          const x = event.clientX - thumbRect.left;
          const y = event.clientY - thumbRect.top;
          scrollbarContext.onThumbPointerDown({ x, y });
        }),
        onPointerUp: composeEventHandlers(props.onPointerUp, scrollbarContext.onThumbPointerUp)
      }
    );
  }
);
ScrollAreaThumb.displayName = THUMB_NAME;
var CORNER_NAME = "ScrollAreaCorner";
var ScrollAreaCorner = React.forwardRef(
  (props, forwardedRef) => {
    const context = useScrollAreaContext(CORNER_NAME, props.__scopeScrollArea);
    const hasBothScrollbarsVisible = Boolean(context.scrollbarX && context.scrollbarY);
    const hasCorner = context.type !== "scroll" && hasBothScrollbarsVisible;
    return hasCorner ? /* @__PURE__ */ jsx(ScrollAreaCornerImpl, { ...props, ref: forwardedRef }) : null;
  }
);
ScrollAreaCorner.displayName = CORNER_NAME;
var ScrollAreaCornerImpl = React.forwardRef((props, forwardedRef) => {
  const { __scopeScrollArea, ...cornerProps } = props;
  const context = useScrollAreaContext(CORNER_NAME, __scopeScrollArea);
  const [width, setWidth] = React.useState(0);
  const [height, setHeight] = React.useState(0);
  const hasSize = Boolean(width && height);
  useResizeObserver(context.scrollbarX, () => {
    const height2 = context.scrollbarX?.offsetHeight || 0;
    context.onCornerHeightChange(height2);
    setHeight(height2);
  });
  useResizeObserver(context.scrollbarY, () => {
    const width2 = context.scrollbarY?.offsetWidth || 0;
    context.onCornerWidthChange(width2);
    setWidth(width2);
  });
  return hasSize ? /* @__PURE__ */ jsx(
    Primitive.div,
    {
      ...cornerProps,
      ref: forwardedRef,
      style: {
        width,
        height,
        position: "absolute",
        right: context.dir === "ltr" ? 0 : void 0,
        left: context.dir === "rtl" ? 0 : void 0,
        bottom: 0,
        ...props.style
      }
    }
  ) : null;
});
function toInt(value) {
  return value ? parseInt(value, 10) : 0;
}
function getThumbRatio(viewportSize, contentSize) {
  const ratio = viewportSize / contentSize;
  return isNaN(ratio) ? 0 : ratio;
}
function getThumbSize(sizes) {
  const ratio = getThumbRatio(sizes.viewport, sizes.content);
  const scrollbarPadding = sizes.scrollbar.paddingStart + sizes.scrollbar.paddingEnd;
  const thumbSize = (sizes.scrollbar.size - scrollbarPadding) * ratio;
  return Math.max(thumbSize, 18);
}
function getScrollPositionFromPointer(pointerPos, pointerOffset, sizes, dir = "ltr") {
  const thumbSizePx = getThumbSize(sizes);
  const thumbCenter = thumbSizePx / 2;
  const offset = pointerOffset || thumbCenter;
  const thumbOffsetFromEnd = thumbSizePx - offset;
  const minPointerPos = sizes.scrollbar.paddingStart + offset;
  const maxPointerPos = sizes.scrollbar.size - sizes.scrollbar.paddingEnd - thumbOffsetFromEnd;
  const maxScrollPos = sizes.content - sizes.viewport;
  const scrollRange = dir === "ltr" ? [0, maxScrollPos] : [maxScrollPos * -1, 0];
  const interpolate = linearScale([minPointerPos, maxPointerPos], scrollRange);
  return interpolate(pointerPos);
}
function getThumbOffsetFromScroll(scrollPos, sizes, dir = "ltr") {
  const thumbSizePx = getThumbSize(sizes);
  const scrollbarPadding = sizes.scrollbar.paddingStart + sizes.scrollbar.paddingEnd;
  const scrollbar = sizes.scrollbar.size - scrollbarPadding;
  const maxScrollPos = sizes.content - sizes.viewport;
  const maxThumbPos = scrollbar - thumbSizePx;
  const scrollClampRange = dir === "ltr" ? [0, maxScrollPos] : [maxScrollPos * -1, 0];
  const scrollWithoutMomentum = clamp(scrollPos, scrollClampRange);
  const interpolate = linearScale([0, maxScrollPos], [0, maxThumbPos]);
  return interpolate(scrollWithoutMomentum);
}
function linearScale(input, output) {
  return (value) => {
    if (input[0] === input[1] || output[0] === output[1]) return output[0];
    const ratio = (output[1] - output[0]) / (input[1] - input[0]);
    return output[0] + ratio * (value - input[0]);
  };
}
function isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos) {
  return scrollPos > 0 && scrollPos < maxScrollPos;
}
var addUnlinkedScrollListener = (node, handler = () => {
}) => {
  let prevPosition = { left: node.scrollLeft, top: node.scrollTop };
  let rAF = 0;
  (function loop() {
    const position = { left: node.scrollLeft, top: node.scrollTop };
    const isHorizontalScroll = prevPosition.left !== position.left;
    const isVerticalScroll = prevPosition.top !== position.top;
    if (isHorizontalScroll || isVerticalScroll) handler();
    prevPosition = position;
    rAF = window.requestAnimationFrame(loop);
  })();
  return () => window.cancelAnimationFrame(rAF);
};
function useDebounceCallback(callback, delay) {
  const handleCallback = useCallbackRef(callback);
  const debounceTimerRef = React.useRef(0);
  React.useEffect(() => () => window.clearTimeout(debounceTimerRef.current), []);
  return React.useCallback(() => {
    window.clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = window.setTimeout(handleCallback, delay);
  }, [handleCallback, delay]);
}
function useResizeObserver(element, onResize) {
  const handleResize = useCallbackRef(onResize);
  useLayoutEffect2(() => {
    let rAF = 0;
    if (element) {
      const resizeObserver = new ResizeObserver(() => {
        cancelAnimationFrame(rAF);
        rAF = window.requestAnimationFrame(handleResize);
      });
      resizeObserver.observe(element);
      return () => {
        window.cancelAnimationFrame(rAF);
        resizeObserver.unobserve(element);
      };
    }
  }, [element, handleResize]);
}
var Root$2 = ScrollArea$1;
var Viewport = ScrollAreaViewport;
var Corner = ScrollAreaCorner;

const ScrollArea = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  Root$2,
  {
    ref,
    className: cn("relative overflow-hidden", className),
    ...props,
    children: [
      /* @__PURE__ */ jsx(Viewport, { className: "h-full w-full rounded-[inherit]", children }),
      /* @__PURE__ */ jsx(ScrollBar, {}),
      /* @__PURE__ */ jsx(Corner, {})
    ]
  }
));
ScrollArea.displayName = Root$2.displayName;
const ScrollBar = React.forwardRef(({ className, orientation = "vertical", ...props }, ref) => /* @__PURE__ */ jsx(
  ScrollAreaScrollbar,
  {
    ref,
    orientation,
    className: cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-border" })
  }
));
ScrollBar.displayName = ScrollAreaScrollbar.displayName;

function UploadProgressDialog({ open, files, onComplete }) {
  const allComplete = files.length > 0 && files.every((f) => f.status === "success" || f.status === "error");
  const hasErrors = files.some((f) => f.status === "error");
  const successCount = files.filter((f) => f.status === "success").length;
  const errorCount = files.filter((f) => f.status === "error").length;
  const totalProgress = files.length > 0 ? files.reduce((sum, f) => sum + f.progress, 0) / files.length : 0;
  files.some((f) => f.status === "uploading" || f.status === "pending");
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange: (open2) => {
    if (!open2 && allComplete) {
      onComplete();
    }
    if (!open2 && !allComplete) {
      return;
    }
  }, children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-2xl max-h-[80vh]", children: [
    /* @__PURE__ */ jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsx(DialogTitle, { className: "flex items-center gap-2 text-lg", children: allComplete ? hasErrors ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(XCircle, { className: "h-5 w-5 text-yellow-500" }),
        "上传完成（部分失败）"
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5 text-green-500" }),
        "上传完成"
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Upload, { className: "h-5 w-5" }),
        "正在上传文件"
      ] }) }),
      /* @__PURE__ */ jsx(DialogDescription, { className: "text-base", children: allComplete ? /* @__PURE__ */ jsxs(Fragment, { children: [
        successCount > 0 && /* @__PURE__ */ jsxs("span", { className: "text-green-600 font-medium", children: [
          successCount,
          " 个文件上传成功"
        ] }),
        successCount > 0 && errorCount > 0 && /* @__PURE__ */ jsx("span", { children: "，" }),
        errorCount > 0 && /* @__PURE__ */ jsxs("span", { className: "text-red-600 font-medium", children: [
          errorCount,
          " 个文件上传失败"
        ] })
      ] }) : `正在上传 ${files.length} 个文件...` })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      !allComplete && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm font-medium", children: [
          /* @__PURE__ */ jsx("span", { children: "总进度" }),
          /* @__PURE__ */ jsxs("span", { children: [
            Math.round(totalProgress),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsx(Progress, { value: totalProgress, className: "h-2" })
      ] }),
      /* @__PURE__ */ jsx(ScrollArea, { className: "h-64 pr-4", children: /* @__PURE__ */ jsx("div", { className: "space-y-2", children: files.map((file, index) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3 rounded-lg bg-muted/50", children: [
        file.status === "success" ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" }) : file.status === "error" ? /* @__PURE__ */ jsx(XCircle, { className: "h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" }) : /* @__PURE__ */ jsx(Upload, { className: "h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium truncate", children: file.name }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mt-1", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
              (file.size / 1024 / 1024).toFixed(2),
              " MB"
            ] }),
            file.status === "uploading" && /* @__PURE__ */ jsxs("span", { className: "text-xs text-primary font-medium", children: [
              file.progress,
              "%"
            ] })
          ] }),
          file.status === "error" && file.error && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-500 mt-1", children: file.error }),
          file.status === "uploading" && /* @__PURE__ */ jsx(Progress, { value: file.progress, className: "h-1.5 mt-2" })
        ] })
      ] }, index)) }) })
    ] }),
    /* @__PURE__ */ jsx(DialogFooter, { className: "gap-2", children: allComplete ? /* @__PURE__ */ jsx(
      Button,
      {
        onClick: onComplete,
        className: !hasErrors ? "bg-green-600 hover:bg-green-700 min-w-[120px]" : "min-w-[120px]",
        size: "lg",
        children: "完成"
      }
    ) : /* @__PURE__ */ jsx(
      Button,
      {
        disabled: true,
        variant: "secondary",
        className: "min-w-[120px]",
        size: "lg",
        children: "上传中..."
      }
    ) })
  ] }) });
}

function isSupportedFile(file) {
  const pdfTypes = ["application/pdf"];
  const excelTypes = [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel.sheet.macroEnabled.12"
  ];
  const pdfExtensions = [".pdf"];
  const excelExtensions = [".xls", ".xlsx", ".xlsm", ".xlsb"];
  const fileName = file.name.toLowerCase();
  const isPDF = pdfTypes.includes(file.type) || pdfExtensions.some((ext) => fileName.endsWith(ext));
  const isExcel = excelTypes.includes(file.type) || excelExtensions.some((ext) => fileName.endsWith(ext));
  return isPDF || isExcel;
}
function getFileColor(file) {
  const fileName = file.name.toLowerCase();
  if (fileName.endsWith(".pdf") || file.type === "application/pdf") {
    return "text-red-500";
  }
  if ([".xls", ".xlsx", ".xlsm", ".xlsb"].some((ext) => fileName.endsWith(ext))) {
    return "text-green-500";
  }
  return "text-gray-500";
}
function FileUpload({ onUploadComplete, folderId, compact = false }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    console.log("[Upload] 拖拽的文件:", files.map((f) => ({ name: f.name, type: f.type })));
    const supportedFiles = files.filter((f) => {
      const supported = isSupportedFile(f);
      console.log(`[Upload] 文件 ${f.name} 是否支持:`, supported);
      return supported;
    });
    if (supportedFiles.length === 0) {
      toast({
        title: "文件类型错误",
        description: "只支持PDF和Excel文件（.xls, .xlsx, .xlsm）",
        variant: "destructive"
      });
      return;
    }
    console.log("[Upload] 支持的文件数量:", supportedFiles.length);
    const newUploadFiles = supportedFiles.map((file) => ({
      file,
      progress: 0,
      status: "pending"
    }));
    console.log("[Upload] 添加文件到上传列表:", newUploadFiles.map((f) => f.file.name));
    setUploadFiles((prev) => [...prev, ...newUploadFiles]);
  }, [toast]);
  const handleFileSelect = useCallback((e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    console.log("[Upload] 选择的文件:", Array.from(files).map((f) => ({ name: f.name, type: f.type })));
    const newUploadFiles = Array.from(files).filter((f) => {
      const supported = isSupportedFile(f);
      console.log(`[Upload] 文件 ${f.name} 是否支持:`, supported);
      return supported;
    }).map((file) => ({
      file,
      progress: 0,
      status: "pending"
    }));
    if (newUploadFiles.length === 0) {
      toast({
        title: "文件类型错误",
        description: "只支持PDF和Excel文件（.xls, .xlsx, .xlsm）",
        variant: "destructive"
      });
      return;
    }
    console.log("[Upload] 添加文件到上传列表:", newUploadFiles.map((f) => f.file.name));
    setUploadFiles((prev) => [...prev, ...newUploadFiles]);
  }, [toast]);
  useEffect(() => {
    const hasPendingFiles2 = uploadFiles.some((f) => f.status === "pending");
    console.log("[Upload] 自动上传检查:", {
      uploadFilesCount: uploadFiles.length,
      hasPendingFiles: hasPendingFiles2,
      isUploading,
      uploadFiles: uploadFiles.map((f) => ({ name: f.file.name, status: f.status }))
    });
    if (hasPendingFiles2 && !isUploading) {
      console.log("[Upload] 触发自动上传");
      handleUpload();
    }
  }, [uploadFiles, isUploading]);
  useEffect(() => {
    const allComplete = uploadFiles.length > 0 && uploadFiles.every((f) => f.status === "success" || f.status === "error");
    const hasUploading = uploadFiles.some((f) => f.status === "uploading" || f.status === "pending");
    console.log("[Upload Debug] allComplete:", allComplete, "showProgressDialog:", showProgressDialog, "hasUploading:", hasUploading, "isUploading:", isUploading);
    if (allComplete && showProgressDialog && !hasUploading) {
      console.log("[Upload Debug] Setting auto-close timer");
      const timer = setTimeout(() => {
        console.log("[Upload Debug] Auto-closing dialog");
        setShowProgressDialog(false);
        setUploadFiles([]);
        if (folderId) {
          sessionStorage.setItem("lastSelectedFolderId", folderId);
        }
      }, 5e3);
      return () => {
        console.log("[Upload Debug] Clearing timer");
        clearTimeout(timer);
      };
    }
  }, [uploadFiles, showProgressDialog, isUploading, folderId]);
  const removeFile = useCallback((index) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);
  const handleUpload = async () => {
    const pendingFiles = uploadFiles.filter((f) => f.status === "pending");
    if (pendingFiles.length === 0) return;
    setIsUploading(true);
    setShowProgressDialog(true);
    setUploadFiles(
      (prev) => prev.map(
        (f) => f.status === "pending" ? { ...f, status: "uploading", progress: 0 } : f
      )
    );
    await Promise.all(
      pendingFiles.map(async (uploadFile, index) => {
        const fileIndex = uploadFiles.findIndex((f) => f.file === uploadFile.file);
        try {
          console.log("[Upload Client] 开始上传文件:", uploadFile.file.name);
          const formData = new FormData();
          formData.append("file", uploadFile.file);
          if (folderId) {
            formData.append("folderId", folderId);
          }
          let uploadResponseData;
          await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.upload.addEventListener("progress", (e) => {
              if (e.lengthComputable) {
                const percentComplete = Math.round(e.loaded / e.total * 100);
                setUploadFiles(
                  (prev) => prev.map(
                    (f, i) => i === fileIndex ? { ...f, progress: percentComplete } : f
                  )
                );
              }
            });
            xhr.addEventListener("load", () => {
              console.log("[Upload Client] XHR load 事件触发", {
                status: xhr.status,
                statusText: xhr.statusText,
                responseType: xhr.responseType,
                responseText: xhr.responseText
              });
              if (xhr.status === 200) {
                try {
                  uploadResponseData = JSON.parse(xhr.responseText);
                  console.log("[Upload Client] 解析后的响应", uploadResponseData);
                } catch (e) {
                  console.error("[Upload Client] 解析响应失败", e);
                }
                setUploadFiles(
                  (prev) => prev.map(
                    (f, i) => i === fileIndex ? { ...f, status: "success", progress: 100 } : f
                  )
                );
                if (uploadResponseData?.parseError) {
                  console.warn("[Upload Client] 文件上传成功但解析失败", uploadResponseData.parseError);
                }
                resolve();
              } else {
                console.error("[Upload Client] 上传失败响应", {
                  status: xhr.status,
                  statusText: xhr.statusText,
                  responseText: xhr.responseText
                });
                let errorMessage = "上传失败";
                try {
                  const response = JSON.parse(xhr.responseText);
                  console.log("[Upload Client] 解析后的错误响应", response);
                  if (response.error === "文件已存在") {
                    errorMessage = "文件已存在";
                  } else if (response.error) {
                    errorMessage = response.error;
                  }
                } catch (e) {
                  console.error("[Upload Client] 解析响应失败", e);
                  if (xhr.status === 409) {
                    errorMessage = "文件已存在";
                  }
                }
                reject(new Error(errorMessage));
              }
            });
            xhr.addEventListener("error", () => {
              console.error("[Upload Client] XHR error 事件触发", {
                readyState: xhr.readyState,
                status: xhr.status,
                statusText: xhr.statusText
              });
              reject(new Error("网络错误"));
            });
            xhr.addEventListener("abort", () => {
              console.error("[Upload Client] XHR abort 事件触发");
              reject(new Error("上传被取消"));
            });
            xhr.open("POST", `${process.env.NEXT_PUBLIC_UPLOAD_SERVER_URL || "http://localhost:3001"}/upload`);
            xhr.send(formData);
          });
          if (uploadResponseData?.data?.filename) {
            let tempBlobUrl;
            const isPdf = uploadFile.file.type === "application/pdf" || uploadFile.file.name.toLowerCase().endsWith(".pdf");
            if (isPdf) {
              try {
                console.log("[Upload Client] 开始上传临时 Blob");
                const tempFormData = new FormData();
                tempFormData.append("file", uploadFile.file);
                const tempBlobResponse = await fetch("/api/upload-temp-blob", {
                  method: "POST",
                  body: tempFormData
                });
                if (tempBlobResponse.ok) {
                  const tempBlobData = await tempBlobResponse.json();
                  tempBlobUrl = tempBlobData.data?.url;
                  console.log("[Upload Client] 临时 Blob 上传成功:", tempBlobUrl);
                } else {
                  console.warn("[Upload Client] 临时 Blob 上传失败，将跳过预览解析");
                }
              } catch (error) {
                console.warn("[Upload Client] 临时 Blob 上传异常，将跳过预览解析:", error);
              }
            }
            try {
              const metaResponse = await fetch("/api/save-file-meta", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: uploadFile.file.name,
                  folderId,
                  serverFilename: uploadResponseData.data.filename,
                  serverUrl: uploadResponseData.data.url,
                  size: uploadResponseData.data.size,
                  mimeType: uploadResponseData.data.mimetype,
                  hash: uploadResponseData.data.hash,
                  // 传递文件哈希用于重复检测
                  tempBlobUrl
                  // 传递临时 Blob URL 用于解析
                })
              });
              if (!metaResponse.ok) {
                const metaError = await metaResponse.json();
                console.warn("[Upload Client] 元数据保存失败", metaError);
                uploadResponseData = {
                  ...uploadResponseData,
                  parseError: `元数据保存失败: ${metaError.error || metaResponse.statusText}`
                };
              } else {
                console.log("[Upload Client] 元数据保存成功");
              }
            } catch (error) {
              console.warn("[Upload Client] 元数据保存异常", error);
              uploadResponseData = {
                ...uploadResponseData,
                parseError: `元数据保存失败: ${error instanceof Error ? error.message : "未知错误"}`
              };
            }
          }
          const toastMessage = uploadResponseData?.parseError ? `${uploadFile.file.name} 已上传，但解析失败` : `${uploadFile.file.name} 已上传`;
          const toastTitle = uploadResponseData?.parseError ? "上传成功（解析失败）" : "上传成功";
          toast({
            title: toastTitle,
            description: toastMessage,
            ...uploadResponseData?.parseError && { variant: "default" }
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "上传失败";
          console.error("[Upload Client] ❌ 上传失败:", { fileName: uploadFile.file.name, error, errorMessage });
          setUploadFiles(
            (prev) => prev.map(
              (f, i) => i === fileIndex ? { ...f, status: "error", error: errorMessage } : f
            )
          );
          toast({
            title: "上传失败",
            description: `${uploadFile.file.name}: ${errorMessage}`,
            variant: "destructive"
          });
        }
      })
    );
    onUploadComplete?.();
    setIsUploading(false);
  };
  const handleDialogComplete = () => {
    setShowProgressDialog(false);
    setUploadFiles([]);
    if (folderId) {
      sessionStorage.setItem("lastSelectedFolderId", folderId);
    }
    onUploadComplete?.();
  };
  uploadFiles.length > 0 ? uploadFiles.reduce((sum, f) => sum + f.progress, 0) / uploadFiles.length : 0;
  uploadFiles.some((f) => f.status === "pending");
  if (compact) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "file",
            accept: ".pdf,.xls,.xlsx,.xlsm,.xlsb,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            multiple: true,
            onChange: handleFileSelect,
            className: "hidden",
            id: "file-upload-compact",
            disabled: isUploading
          }
        ),
        /* @__PURE__ */ jsx("label", { htmlFor: "file-upload-compact", children: /* @__PURE__ */ jsx(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: "w-full justify-start",
            asChild: true,
            disabled: isUploading,
            children: /* @__PURE__ */ jsxs("span", { children: [
              /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4 mr-2" }),
              isUploading ? "上传中..." : "上传文件"
            ] })
          }
        ) }),
        uploadFiles.length > 0 && /* @__PURE__ */ jsx("div", { className: "space-y-2", children: uploadFiles.map((uploadFile, index) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs", children: [
          /* @__PURE__ */ jsx(FileText, { className: `h-3 w-3 ${getFileColor(uploadFile.file)} flex-shrink-0` }),
          /* @__PURE__ */ jsx("span", { className: "flex-1 truncate", children: uploadFile.file.name }),
          uploadFile.status === "success" && /* @__PURE__ */ jsx("span", { className: "text-green-500", children: "✓" }),
          uploadFile.status === "error" && /* @__PURE__ */ jsx("span", { className: "text-red-500", children: "✗" })
        ] }, index)) })
      ] }),
      /* @__PURE__ */ jsx(
        UploadProgressDialog,
        {
          open: showProgressDialog,
          files: uploadFiles.map((f) => ({
            name: f.file.name,
            size: f.file.size,
            status: f.status,
            progress: f.progress,
            error: f.error
          })),
          onComplete: handleDialogComplete
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Card, { className: "w-full", children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: uploadFiles.length === 0 ? /* @__PURE__ */ jsxs(
      "div",
      {
        className: `border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}`,
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
        children: [
          /* @__PURE__ */ jsx(Upload, { className: "h-12 w-12 mx-auto mb-4 text-muted-foreground" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-2", children: "拖拽PDF或Excel文件到此处，或点击选择文件（支持多选）" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "file",
              accept: ".pdf,.xls,.xlsx,.xlsm,.xlsb,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              multiple: true,
              onChange: handleFileSelect,
              className: "hidden",
              id: "file-upload",
              disabled: isUploading
            }
          ),
          /* @__PURE__ */ jsx("label", { htmlFor: "file-upload", children: /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", asChild: true, disabled: isUploading, children: /* @__PURE__ */ jsx("span", { children: "选择文件" }) }) })
        ]
      }
    ) : /* @__PURE__ */ jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsx("div", { className: "space-y-2", children: uploadFiles.map((uploadFile, index) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 p-3 bg-muted rounded-lg", children: [
      /* @__PURE__ */ jsx(FileText, { className: `h-8 w-8 ${getFileColor(uploadFile.file)} flex-shrink-0` }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium truncate", children: uploadFile.file.name }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
          (uploadFile.file.size / 1024 / 1024).toFixed(2),
          " MB"
        ] }),
        uploadFile.status === "uploading" && /* @__PURE__ */ jsx(Progress, { value: uploadFile.progress, className: "h-1 mt-1" }),
        uploadFile.status === "success" && /* @__PURE__ */ jsx("p", { className: "text-xs text-green-500 mt-1", children: "上传成功" }),
        uploadFile.status === "error" && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-500 mt-1", children: uploadFile.error })
      ] }),
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "ghost",
          size: "icon",
          onClick: () => removeFile(index),
          disabled: uploadFile.status === "uploading" || uploadFile.status === "success",
          children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
        }
      )
    ] }, index)) }) }) }) }),
    /* @__PURE__ */ jsx(
      UploadProgressDialog,
      {
        open: showProgressDialog,
        files: uploadFiles.map((f) => ({
          name: f.file.name,
          size: f.file.size,
          status: f.status,
          progress: f.progress,
          error: f.error
        })),
        onComplete: handleDialogComplete
      }
    )
  ] });
}

// src/slot.tsx
// @__NO_SIDE_EFFECTS__
function createSlot$1(ownerName) {
  const SlotClone = /* @__PURE__ */ createSlotClone$1(ownerName);
  const Slot2 = React.forwardRef((props, forwardedRef) => {
    const { children, ...slotProps } = props;
    const childrenArray = React.Children.toArray(children);
    const slottable = childrenArray.find(isSlottable$1);
    if (slottable) {
      const newElement = slottable.props.children;
      const newChildren = childrenArray.map((child) => {
        if (child === slottable) {
          if (React.Children.count(newElement) > 1) return React.Children.only(null);
          return React.isValidElement(newElement) ? newElement.props.children : null;
        } else {
          return child;
        }
      });
      return /* @__PURE__ */ jsx(SlotClone, { ...slotProps, ref: forwardedRef, children: React.isValidElement(newElement) ? React.cloneElement(newElement, void 0, newChildren) : null });
    }
    return /* @__PURE__ */ jsx(SlotClone, { ...slotProps, ref: forwardedRef, children });
  });
  Slot2.displayName = `${ownerName}.Slot`;
  return Slot2;
}
// @__NO_SIDE_EFFECTS__
function createSlotClone$1(ownerName) {
  const SlotClone = React.forwardRef((props, forwardedRef) => {
    const { children, ...slotProps } = props;
    if (React.isValidElement(children)) {
      const childrenRef = getElementRef$1(children);
      const props2 = mergeProps$1(slotProps, children.props);
      if (children.type !== React.Fragment) {
        props2.ref = forwardedRef ? composeRefs(forwardedRef, childrenRef) : childrenRef;
      }
      return React.cloneElement(children, props2);
    }
    return React.Children.count(children) > 1 ? React.Children.only(null) : null;
  });
  SlotClone.displayName = `${ownerName}.SlotClone`;
  return SlotClone;
}
var SLOTTABLE_IDENTIFIER$1 = Symbol("radix.slottable");
function isSlottable$1(child) {
  return React.isValidElement(child) && typeof child.type === "function" && "__radixId" in child.type && child.type.__radixId === SLOTTABLE_IDENTIFIER$1;
}
function mergeProps$1(slotProps, childProps) {
  const overrideProps = { ...childProps };
  for (const propName in childProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];
    const isHandler = /^on[A-Z]/.test(propName);
    if (isHandler) {
      if (slotPropValue && childPropValue) {
        overrideProps[propName] = (...args) => {
          const result = childPropValue(...args);
          slotPropValue(...args);
          return result;
        };
      } else if (slotPropValue) {
        overrideProps[propName] = slotPropValue;
      }
    } else if (propName === "style") {
      overrideProps[propName] = { ...slotPropValue, ...childPropValue };
    } else if (propName === "className") {
      overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(" ");
    }
  }
  return { ...slotProps, ...overrideProps };
}
function getElementRef$1(element) {
  let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
  let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.ref;
  }
  getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
  mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.props.ref;
  }
  return element.props.ref || element.ref;
}

function createCollection(name) {
  const PROVIDER_NAME = name + "CollectionProvider";
  const [createCollectionContext, createCollectionScope] = createContextScope(PROVIDER_NAME);
  const [CollectionProviderImpl, useCollectionContext] = createCollectionContext(
    PROVIDER_NAME,
    { collectionRef: { current: null }, itemMap: /* @__PURE__ */ new Map() }
  );
  const CollectionProvider = (props) => {
    const { scope, children } = props;
    const ref = React__default.useRef(null);
    const itemMap = React__default.useRef(/* @__PURE__ */ new Map()).current;
    return /* @__PURE__ */ jsx(CollectionProviderImpl, { scope, itemMap, collectionRef: ref, children });
  };
  CollectionProvider.displayName = PROVIDER_NAME;
  const COLLECTION_SLOT_NAME = name + "CollectionSlot";
  const CollectionSlotImpl = createSlot$1(COLLECTION_SLOT_NAME);
  const CollectionSlot = React__default.forwardRef(
    (props, forwardedRef) => {
      const { scope, children } = props;
      const context = useCollectionContext(COLLECTION_SLOT_NAME, scope);
      const composedRefs = useComposedRefs(forwardedRef, context.collectionRef);
      return /* @__PURE__ */ jsx(CollectionSlotImpl, { ref: composedRefs, children });
    }
  );
  CollectionSlot.displayName = COLLECTION_SLOT_NAME;
  const ITEM_SLOT_NAME = name + "CollectionItemSlot";
  const ITEM_DATA_ATTR = "data-radix-collection-item";
  const CollectionItemSlotImpl = createSlot$1(ITEM_SLOT_NAME);
  const CollectionItemSlot = React__default.forwardRef(
    (props, forwardedRef) => {
      const { scope, children, ...itemData } = props;
      const ref = React__default.useRef(null);
      const composedRefs = useComposedRefs(forwardedRef, ref);
      const context = useCollectionContext(ITEM_SLOT_NAME, scope);
      React__default.useEffect(() => {
        context.itemMap.set(ref, { ref, ...itemData });
        return () => void context.itemMap.delete(ref);
      });
      return /* @__PURE__ */ jsx(CollectionItemSlotImpl, { ...{ [ITEM_DATA_ATTR]: "" }, ref: composedRefs, children });
    }
  );
  CollectionItemSlot.displayName = ITEM_SLOT_NAME;
  function useCollection(scope) {
    const context = useCollectionContext(name + "CollectionConsumer", scope);
    const getItems = React__default.useCallback(() => {
      const collectionNode = context.collectionRef.current;
      if (!collectionNode) return [];
      const orderedNodes = Array.from(collectionNode.querySelectorAll(`[${ITEM_DATA_ATTR}]`));
      const items = Array.from(context.itemMap.values());
      const orderedItems = items.sort(
        (a, b) => orderedNodes.indexOf(a.ref.current) - orderedNodes.indexOf(b.ref.current)
      );
      return orderedItems;
    }, [context.collectionRef, context.itemMap]);
    return getItems;
  }
  return [
    { Provider: CollectionProvider, Slot: CollectionSlot, ItemSlot: CollectionItemSlot },
    useCollection,
    createCollectionScope
  ];
}

// src/arrow.tsx
var NAME = "Arrow";
var Arrow$1 = React.forwardRef((props, forwardedRef) => {
  const { children, width = 10, height = 5, ...arrowProps } = props;
  return /* @__PURE__ */ jsx(
    Primitive.svg,
    {
      ...arrowProps,
      ref: forwardedRef,
      width,
      height,
      viewBox: "0 0 30 10",
      preserveAspectRatio: "none",
      children: props.asChild ? children : /* @__PURE__ */ jsx("polygon", { points: "0,0 30,0 15,10" })
    }
  );
});
Arrow$1.displayName = NAME;
var Root$1 = Arrow$1;

// packages/react/use-size/src/use-size.tsx
function useSize(element) {
  const [size, setSize] = React.useState(void 0);
  useLayoutEffect2(() => {
    if (element) {
      setSize({ width: element.offsetWidth, height: element.offsetHeight });
      const resizeObserver = new ResizeObserver((entries) => {
        if (!Array.isArray(entries)) {
          return;
        }
        if (!entries.length) {
          return;
        }
        const entry = entries[0];
        let width;
        let height;
        if ("borderBoxSize" in entry) {
          const borderSizeEntry = entry["borderBoxSize"];
          const borderSize = Array.isArray(borderSizeEntry) ? borderSizeEntry[0] : borderSizeEntry;
          width = borderSize["inlineSize"];
          height = borderSize["blockSize"];
        } else {
          width = element.offsetWidth;
          height = element.offsetHeight;
        }
        setSize({ width, height });
      });
      resizeObserver.observe(element, { box: "border-box" });
      return () => resizeObserver.unobserve(element);
    } else {
      setSize(void 0);
    }
  }, [element]);
  return size;
}

var POPPER_NAME = "Popper";
var [createPopperContext, createPopperScope] = createContextScope(POPPER_NAME);
var [PopperProvider, usePopperContext] = createPopperContext(POPPER_NAME);
var Popper = (props) => {
  const { __scopePopper, children } = props;
  const [anchor, setAnchor] = React.useState(null);
  return /* @__PURE__ */ jsx(PopperProvider, { scope: __scopePopper, anchor, onAnchorChange: setAnchor, children });
};
Popper.displayName = POPPER_NAME;
var ANCHOR_NAME$1 = "PopperAnchor";
var PopperAnchor = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopePopper, virtualRef, ...anchorProps } = props;
    const context = usePopperContext(ANCHOR_NAME$1, __scopePopper);
    const ref = React.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref);
    const anchorRef = React.useRef(null);
    React.useEffect(() => {
      const previousAnchor = anchorRef.current;
      anchorRef.current = virtualRef?.current || ref.current;
      if (previousAnchor !== anchorRef.current) {
        context.onAnchorChange(anchorRef.current);
      }
    });
    return virtualRef ? null : /* @__PURE__ */ jsx(Primitive.div, { ...anchorProps, ref: composedRefs });
  }
);
PopperAnchor.displayName = ANCHOR_NAME$1;
var CONTENT_NAME$2 = "PopperContent";
var [PopperContentProvider, useContentContext] = createPopperContext(CONTENT_NAME$2);
var PopperContent = React.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopePopper,
      side = "bottom",
      sideOffset = 0,
      align = "center",
      alignOffset = 0,
      arrowPadding = 0,
      avoidCollisions = true,
      collisionBoundary = [],
      collisionPadding: collisionPaddingProp = 0,
      sticky = "partial",
      hideWhenDetached = false,
      updatePositionStrategy = "optimized",
      onPlaced,
      ...contentProps
    } = props;
    const context = usePopperContext(CONTENT_NAME$2, __scopePopper);
    const [content, setContent] = React.useState(null);
    const composedRefs = useComposedRefs(forwardedRef, (node) => setContent(node));
    const [arrow$1, setArrow] = React.useState(null);
    const arrowSize = useSize(arrow$1);
    const arrowWidth = arrowSize?.width ?? 0;
    const arrowHeight = arrowSize?.height ?? 0;
    const desiredPlacement = side + (align !== "center" ? "-" + align : "");
    const collisionPadding = typeof collisionPaddingProp === "number" ? collisionPaddingProp : { top: 0, right: 0, bottom: 0, left: 0, ...collisionPaddingProp };
    const boundary = Array.isArray(collisionBoundary) ? collisionBoundary : [collisionBoundary];
    const hasExplicitBoundaries = boundary.length > 0;
    const detectOverflowOptions = {
      padding: collisionPadding,
      boundary: boundary.filter(isNotNull),
      // with `strategy: 'fixed'`, this is the only way to get it to respect boundaries
      altBoundary: hasExplicitBoundaries
    };
    const { refs, floatingStyles, placement, isPositioned, middlewareData } = useFloating({
      // default to `fixed` strategy so users don't have to pick and we also avoid focus scroll issues
      strategy: "fixed",
      placement: desiredPlacement,
      whileElementsMounted: (...args) => {
        const cleanup = autoUpdate(...args, {
          animationFrame: updatePositionStrategy === "always"
        });
        return cleanup;
      },
      elements: {
        reference: context.anchor
      },
      middleware: [
        offset({ mainAxis: sideOffset + arrowHeight, alignmentAxis: alignOffset }),
        avoidCollisions && shift({
          mainAxis: true,
          crossAxis: false,
          limiter: sticky === "partial" ? limitShift() : void 0,
          ...detectOverflowOptions
        }),
        avoidCollisions && flip({ ...detectOverflowOptions }),
        size({
          ...detectOverflowOptions,
          apply: ({ elements, rects, availableWidth, availableHeight }) => {
            const { width: anchorWidth, height: anchorHeight } = rects.reference;
            const contentStyle = elements.floating.style;
            contentStyle.setProperty("--radix-popper-available-width", `${availableWidth}px`);
            contentStyle.setProperty("--radix-popper-available-height", `${availableHeight}px`);
            contentStyle.setProperty("--radix-popper-anchor-width", `${anchorWidth}px`);
            contentStyle.setProperty("--radix-popper-anchor-height", `${anchorHeight}px`);
          }
        }),
        arrow$1 && arrow({ element: arrow$1, padding: arrowPadding }),
        transformOrigin({ arrowWidth, arrowHeight }),
        hideWhenDetached && hide({ strategy: "referenceHidden", ...detectOverflowOptions })
      ]
    });
    const [placedSide, placedAlign] = getSideAndAlignFromPlacement(placement);
    const handlePlaced = useCallbackRef(onPlaced);
    useLayoutEffect2(() => {
      if (isPositioned) {
        handlePlaced?.();
      }
    }, [isPositioned, handlePlaced]);
    const arrowX = middlewareData.arrow?.x;
    const arrowY = middlewareData.arrow?.y;
    const cannotCenterArrow = middlewareData.arrow?.centerOffset !== 0;
    const [contentZIndex, setContentZIndex] = React.useState();
    useLayoutEffect2(() => {
      if (content) setContentZIndex(window.getComputedStyle(content).zIndex);
    }, [content]);
    return /* @__PURE__ */ jsx(
      "div",
      {
        ref: refs.setFloating,
        "data-radix-popper-content-wrapper": "",
        style: {
          ...floatingStyles,
          transform: isPositioned ? floatingStyles.transform : "translate(0, -200%)",
          // keep off the page when measuring
          minWidth: "max-content",
          zIndex: contentZIndex,
          ["--radix-popper-transform-origin"]: [
            middlewareData.transformOrigin?.x,
            middlewareData.transformOrigin?.y
          ].join(" "),
          // hide the content if using the hide middleware and should be hidden
          // set visibility to hidden and disable pointer events so the UI behaves
          // as if the PopperContent isn't there at all
          ...middlewareData.hide?.referenceHidden && {
            visibility: "hidden",
            pointerEvents: "none"
          }
        },
        dir: props.dir,
        children: /* @__PURE__ */ jsx(
          PopperContentProvider,
          {
            scope: __scopePopper,
            placedSide,
            onArrowChange: setArrow,
            arrowX,
            arrowY,
            shouldHideArrow: cannotCenterArrow,
            children: /* @__PURE__ */ jsx(
              Primitive.div,
              {
                "data-side": placedSide,
                "data-align": placedAlign,
                ...contentProps,
                ref: composedRefs,
                style: {
                  ...contentProps.style,
                  // if the PopperContent hasn't been placed yet (not all measurements done)
                  // we prevent animations so that users's animation don't kick in too early referring wrong sides
                  animation: !isPositioned ? "none" : void 0
                }
              }
            )
          }
        )
      }
    );
  }
);
PopperContent.displayName = CONTENT_NAME$2;
var ARROW_NAME$2 = "PopperArrow";
var OPPOSITE_SIDE = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right"
};
var PopperArrow = React.forwardRef(function PopperArrow2(props, forwardedRef) {
  const { __scopePopper, ...arrowProps } = props;
  const contentContext = useContentContext(ARROW_NAME$2, __scopePopper);
  const baseSide = OPPOSITE_SIDE[contentContext.placedSide];
  return (
    // we have to use an extra wrapper because `ResizeObserver` (used by `useSize`)
    // doesn't report size as we'd expect on SVG elements.
    // it reports their bounding box which is effectively the largest path inside the SVG.
    /* @__PURE__ */ jsx(
      "span",
      {
        ref: contentContext.onArrowChange,
        style: {
          position: "absolute",
          left: contentContext.arrowX,
          top: contentContext.arrowY,
          [baseSide]: 0,
          transformOrigin: {
            top: "",
            right: "0 0",
            bottom: "center 0",
            left: "100% 0"
          }[contentContext.placedSide],
          transform: {
            top: "translateY(100%)",
            right: "translateY(50%) rotate(90deg) translateX(-50%)",
            bottom: `rotate(180deg)`,
            left: "translateY(50%) rotate(-90deg) translateX(50%)"
          }[contentContext.placedSide],
          visibility: contentContext.shouldHideArrow ? "hidden" : void 0
        },
        children: /* @__PURE__ */ jsx(
          Root$1,
          {
            ...arrowProps,
            ref: forwardedRef,
            style: {
              ...arrowProps.style,
              // ensures the element can be measured correctly (mostly for if SVG)
              display: "block"
            }
          }
        )
      }
    )
  );
});
PopperArrow.displayName = ARROW_NAME$2;
function isNotNull(value) {
  return value !== null;
}
var transformOrigin = (options) => ({
  name: "transformOrigin",
  options,
  fn(data) {
    const { placement, rects, middlewareData } = data;
    const cannotCenterArrow = middlewareData.arrow?.centerOffset !== 0;
    const isArrowHidden = cannotCenterArrow;
    const arrowWidth = isArrowHidden ? 0 : options.arrowWidth;
    const arrowHeight = isArrowHidden ? 0 : options.arrowHeight;
    const [placedSide, placedAlign] = getSideAndAlignFromPlacement(placement);
    const noArrowAlign = { start: "0%", center: "50%", end: "100%" }[placedAlign];
    const arrowXCenter = (middlewareData.arrow?.x ?? 0) + arrowWidth / 2;
    const arrowYCenter = (middlewareData.arrow?.y ?? 0) + arrowHeight / 2;
    let x = "";
    let y = "";
    if (placedSide === "bottom") {
      x = isArrowHidden ? noArrowAlign : `${arrowXCenter}px`;
      y = `${-arrowHeight}px`;
    } else if (placedSide === "top") {
      x = isArrowHidden ? noArrowAlign : `${arrowXCenter}px`;
      y = `${rects.floating.height + arrowHeight}px`;
    } else if (placedSide === "right") {
      x = `${-arrowHeight}px`;
      y = isArrowHidden ? noArrowAlign : `${arrowYCenter}px`;
    } else if (placedSide === "left") {
      x = `${rects.floating.width + arrowHeight}px`;
      y = isArrowHidden ? noArrowAlign : `${arrowYCenter}px`;
    }
    return { data: { x, y } };
  }
});
function getSideAndAlignFromPlacement(placement) {
  const [side, align = "center"] = placement.split("-");
  return [side, align];
}
var Root2$1 = Popper;
var Anchor = PopperAnchor;
var Content = PopperContent;
var Arrow = PopperArrow;

var ENTRY_FOCUS = "rovingFocusGroup.onEntryFocus";
var EVENT_OPTIONS = { bubbles: false, cancelable: true };
var GROUP_NAME$2 = "RovingFocusGroup";
var [Collection$1, useCollection$1, createCollectionScope$1] = createCollection(GROUP_NAME$2);
var [createRovingFocusGroupContext, createRovingFocusGroupScope] = createContextScope(
  GROUP_NAME$2,
  [createCollectionScope$1]
);
var [RovingFocusProvider, useRovingFocusContext] = createRovingFocusGroupContext(GROUP_NAME$2);
var RovingFocusGroup = React.forwardRef(
  (props, forwardedRef) => {
    return /* @__PURE__ */ jsx(Collection$1.Provider, { scope: props.__scopeRovingFocusGroup, children: /* @__PURE__ */ jsx(Collection$1.Slot, { scope: props.__scopeRovingFocusGroup, children: /* @__PURE__ */ jsx(RovingFocusGroupImpl, { ...props, ref: forwardedRef }) }) });
  }
);
RovingFocusGroup.displayName = GROUP_NAME$2;
var RovingFocusGroupImpl = React.forwardRef((props, forwardedRef) => {
  const {
    __scopeRovingFocusGroup,
    orientation,
    loop = false,
    dir,
    currentTabStopId: currentTabStopIdProp,
    defaultCurrentTabStopId,
    onCurrentTabStopIdChange,
    onEntryFocus,
    preventScrollOnEntryFocus = false,
    ...groupProps
  } = props;
  const ref = React.useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, ref);
  const direction = useDirection(dir);
  const [currentTabStopId, setCurrentTabStopId] = useControllableState({
    prop: currentTabStopIdProp,
    defaultProp: defaultCurrentTabStopId ?? null,
    onChange: onCurrentTabStopIdChange,
    caller: GROUP_NAME$2
  });
  const [isTabbingBackOut, setIsTabbingBackOut] = React.useState(false);
  const handleEntryFocus = useCallbackRef(onEntryFocus);
  const getItems = useCollection$1(__scopeRovingFocusGroup);
  const isClickFocusRef = React.useRef(false);
  const [focusableItemsCount, setFocusableItemsCount] = React.useState(0);
  React.useEffect(() => {
    const node = ref.current;
    if (node) {
      node.addEventListener(ENTRY_FOCUS, handleEntryFocus);
      return () => node.removeEventListener(ENTRY_FOCUS, handleEntryFocus);
    }
  }, [handleEntryFocus]);
  return /* @__PURE__ */ jsx(
    RovingFocusProvider,
    {
      scope: __scopeRovingFocusGroup,
      orientation,
      dir: direction,
      loop,
      currentTabStopId,
      onItemFocus: React.useCallback(
        (tabStopId) => setCurrentTabStopId(tabStopId),
        [setCurrentTabStopId]
      ),
      onItemShiftTab: React.useCallback(() => setIsTabbingBackOut(true), []),
      onFocusableItemAdd: React.useCallback(
        () => setFocusableItemsCount((prevCount) => prevCount + 1),
        []
      ),
      onFocusableItemRemove: React.useCallback(
        () => setFocusableItemsCount((prevCount) => prevCount - 1),
        []
      ),
      children: /* @__PURE__ */ jsx(
        Primitive.div,
        {
          tabIndex: isTabbingBackOut || focusableItemsCount === 0 ? -1 : 0,
          "data-orientation": orientation,
          ...groupProps,
          ref: composedRefs,
          style: { outline: "none", ...props.style },
          onMouseDown: composeEventHandlers(props.onMouseDown, () => {
            isClickFocusRef.current = true;
          }),
          onFocus: composeEventHandlers(props.onFocus, (event) => {
            const isKeyboardFocus = !isClickFocusRef.current;
            if (event.target === event.currentTarget && isKeyboardFocus && !isTabbingBackOut) {
              const entryFocusEvent = new CustomEvent(ENTRY_FOCUS, EVENT_OPTIONS);
              event.currentTarget.dispatchEvent(entryFocusEvent);
              if (!entryFocusEvent.defaultPrevented) {
                const items = getItems().filter((item) => item.focusable);
                const activeItem = items.find((item) => item.active);
                const currentItem = items.find((item) => item.id === currentTabStopId);
                const candidateItems = [activeItem, currentItem, ...items].filter(
                  Boolean
                );
                const candidateNodes = candidateItems.map((item) => item.ref.current);
                focusFirst$1(candidateNodes, preventScrollOnEntryFocus);
              }
            }
            isClickFocusRef.current = false;
          }),
          onBlur: composeEventHandlers(props.onBlur, () => setIsTabbingBackOut(false))
        }
      )
    }
  );
});
var ITEM_NAME$2 = "RovingFocusGroupItem";
var RovingFocusGroupItem = React.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeRovingFocusGroup,
      focusable = true,
      active = false,
      tabStopId,
      children,
      ...itemProps
    } = props;
    const autoId = useId();
    const id = tabStopId || autoId;
    const context = useRovingFocusContext(ITEM_NAME$2, __scopeRovingFocusGroup);
    const isCurrentTabStop = context.currentTabStopId === id;
    const getItems = useCollection$1(__scopeRovingFocusGroup);
    const { onFocusableItemAdd, onFocusableItemRemove, currentTabStopId } = context;
    React.useEffect(() => {
      if (focusable) {
        onFocusableItemAdd();
        return () => onFocusableItemRemove();
      }
    }, [focusable, onFocusableItemAdd, onFocusableItemRemove]);
    return /* @__PURE__ */ jsx(
      Collection$1.ItemSlot,
      {
        scope: __scopeRovingFocusGroup,
        id,
        focusable,
        active,
        children: /* @__PURE__ */ jsx(
          Primitive.span,
          {
            tabIndex: isCurrentTabStop ? 0 : -1,
            "data-orientation": context.orientation,
            ...itemProps,
            ref: forwardedRef,
            onMouseDown: composeEventHandlers(props.onMouseDown, (event) => {
              if (!focusable) event.preventDefault();
              else context.onItemFocus(id);
            }),
            onFocus: composeEventHandlers(props.onFocus, () => context.onItemFocus(id)),
            onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
              if (event.key === "Tab" && event.shiftKey) {
                context.onItemShiftTab();
                return;
              }
              if (event.target !== event.currentTarget) return;
              const focusIntent = getFocusIntent(event, context.orientation, context.dir);
              if (focusIntent !== void 0) {
                if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
                event.preventDefault();
                const items = getItems().filter((item) => item.focusable);
                let candidateNodes = items.map((item) => item.ref.current);
                if (focusIntent === "last") candidateNodes.reverse();
                else if (focusIntent === "prev" || focusIntent === "next") {
                  if (focusIntent === "prev") candidateNodes.reverse();
                  const currentIndex = candidateNodes.indexOf(event.currentTarget);
                  candidateNodes = context.loop ? wrapArray$1(candidateNodes, currentIndex + 1) : candidateNodes.slice(currentIndex + 1);
                }
                setTimeout(() => focusFirst$1(candidateNodes));
              }
            }),
            children: typeof children === "function" ? children({ isCurrentTabStop, hasTabStop: currentTabStopId != null }) : children
          }
        )
      }
    );
  }
);
RovingFocusGroupItem.displayName = ITEM_NAME$2;
var MAP_KEY_TO_FOCUS_INTENT = {
  ArrowLeft: "prev",
  ArrowUp: "prev",
  ArrowRight: "next",
  ArrowDown: "next",
  PageUp: "first",
  Home: "first",
  PageDown: "last",
  End: "last"
};
function getDirectionAwareKey(key, dir) {
  if (dir !== "rtl") return key;
  return key === "ArrowLeft" ? "ArrowRight" : key === "ArrowRight" ? "ArrowLeft" : key;
}
function getFocusIntent(event, orientation, dir) {
  const key = getDirectionAwareKey(event.key, dir);
  if (orientation === "vertical" && ["ArrowLeft", "ArrowRight"].includes(key)) return void 0;
  if (orientation === "horizontal" && ["ArrowUp", "ArrowDown"].includes(key)) return void 0;
  return MAP_KEY_TO_FOCUS_INTENT[key];
}
function focusFirst$1(candidates, preventScroll = false) {
  const PREVIOUSLY_FOCUSED_ELEMENT = document.activeElement;
  for (const candidate of candidates) {
    if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) return;
    candidate.focus({ preventScroll });
    if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT) return;
  }
}
function wrapArray$1(array, startIndex) {
  return array.map((_, index) => array[(startIndex + index) % array.length]);
}
var Root = RovingFocusGroup;
var Item = RovingFocusGroupItem;

// src/slot.tsx
// @__NO_SIDE_EFFECTS__
function createSlot(ownerName) {
  const SlotClone = /* @__PURE__ */ createSlotClone(ownerName);
  const Slot2 = React.forwardRef((props, forwardedRef) => {
    const { children, ...slotProps } = props;
    const childrenArray = React.Children.toArray(children);
    const slottable = childrenArray.find(isSlottable);
    if (slottable) {
      const newElement = slottable.props.children;
      const newChildren = childrenArray.map((child) => {
        if (child === slottable) {
          if (React.Children.count(newElement) > 1) return React.Children.only(null);
          return React.isValidElement(newElement) ? newElement.props.children : null;
        } else {
          return child;
        }
      });
      return /* @__PURE__ */ jsx(SlotClone, { ...slotProps, ref: forwardedRef, children: React.isValidElement(newElement) ? React.cloneElement(newElement, void 0, newChildren) : null });
    }
    return /* @__PURE__ */ jsx(SlotClone, { ...slotProps, ref: forwardedRef, children });
  });
  Slot2.displayName = `${ownerName}.Slot`;
  return Slot2;
}
// @__NO_SIDE_EFFECTS__
function createSlotClone(ownerName) {
  const SlotClone = React.forwardRef((props, forwardedRef) => {
    const { children, ...slotProps } = props;
    if (React.isValidElement(children)) {
      const childrenRef = getElementRef(children);
      const props2 = mergeProps(slotProps, children.props);
      if (children.type !== React.Fragment) {
        props2.ref = forwardedRef ? composeRefs(forwardedRef, childrenRef) : childrenRef;
      }
      return React.cloneElement(children, props2);
    }
    return React.Children.count(children) > 1 ? React.Children.only(null) : null;
  });
  SlotClone.displayName = `${ownerName}.SlotClone`;
  return SlotClone;
}
var SLOTTABLE_IDENTIFIER = Symbol("radix.slottable");
function isSlottable(child) {
  return React.isValidElement(child) && typeof child.type === "function" && "__radixId" in child.type && child.type.__radixId === SLOTTABLE_IDENTIFIER;
}
function mergeProps(slotProps, childProps) {
  const overrideProps = { ...childProps };
  for (const propName in childProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];
    const isHandler = /^on[A-Z]/.test(propName);
    if (isHandler) {
      if (slotPropValue && childPropValue) {
        overrideProps[propName] = (...args) => {
          const result = childPropValue(...args);
          slotPropValue(...args);
          return result;
        };
      } else if (slotPropValue) {
        overrideProps[propName] = slotPropValue;
      }
    } else if (propName === "style") {
      overrideProps[propName] = { ...slotPropValue, ...childPropValue };
    } else if (propName === "className") {
      overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(" ");
    }
  }
  return { ...slotProps, ...overrideProps };
}
function getElementRef(element) {
  let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
  let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.ref;
  }
  getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
  mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.props.ref;
  }
  return element.props.ref || element.ref;
}

var SELECTION_KEYS = ["Enter", " "];
var FIRST_KEYS = ["ArrowDown", "PageUp", "Home"];
var LAST_KEYS = ["ArrowUp", "PageDown", "End"];
var FIRST_LAST_KEYS = [...FIRST_KEYS, ...LAST_KEYS];
var SUB_OPEN_KEYS = {
  ltr: [...SELECTION_KEYS, "ArrowRight"],
  rtl: [...SELECTION_KEYS, "ArrowLeft"]
};
var SUB_CLOSE_KEYS = {
  ltr: ["ArrowLeft"],
  rtl: ["ArrowRight"]
};
var MENU_NAME = "Menu";
var [Collection, useCollection, createCollectionScope] = createCollection(MENU_NAME);
var [createMenuContext, createMenuScope] = createContextScope(MENU_NAME, [
  createCollectionScope,
  createPopperScope,
  createRovingFocusGroupScope
]);
var usePopperScope = createPopperScope();
var useRovingFocusGroupScope = createRovingFocusGroupScope();
var [MenuProvider, useMenuContext] = createMenuContext(MENU_NAME);
var [MenuRootProvider, useMenuRootContext] = createMenuContext(MENU_NAME);
var Menu = (props) => {
  const { __scopeMenu, open = false, children, dir, onOpenChange, modal = true } = props;
  const popperScope = usePopperScope(__scopeMenu);
  const [content, setContent] = React.useState(null);
  const isUsingKeyboardRef = React.useRef(false);
  const handleOpenChange = useCallbackRef(onOpenChange);
  const direction = useDirection(dir);
  React.useEffect(() => {
    const handleKeyDown = () => {
      isUsingKeyboardRef.current = true;
      document.addEventListener("pointerdown", handlePointer, { capture: true, once: true });
      document.addEventListener("pointermove", handlePointer, { capture: true, once: true });
    };
    const handlePointer = () => isUsingKeyboardRef.current = false;
    document.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
      document.removeEventListener("pointerdown", handlePointer, { capture: true });
      document.removeEventListener("pointermove", handlePointer, { capture: true });
    };
  }, []);
  return /* @__PURE__ */ jsx(Root2$1, { ...popperScope, children: /* @__PURE__ */ jsx(
    MenuProvider,
    {
      scope: __scopeMenu,
      open,
      onOpenChange: handleOpenChange,
      content,
      onContentChange: setContent,
      children: /* @__PURE__ */ jsx(
        MenuRootProvider,
        {
          scope: __scopeMenu,
          onClose: React.useCallback(() => handleOpenChange(false), [handleOpenChange]),
          isUsingKeyboardRef,
          dir: direction,
          modal,
          children
        }
      )
    }
  ) });
};
Menu.displayName = MENU_NAME;
var ANCHOR_NAME = "MenuAnchor";
var MenuAnchor = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeMenu, ...anchorProps } = props;
    const popperScope = usePopperScope(__scopeMenu);
    return /* @__PURE__ */ jsx(Anchor, { ...popperScope, ...anchorProps, ref: forwardedRef });
  }
);
MenuAnchor.displayName = ANCHOR_NAME;
var PORTAL_NAME$1 = "MenuPortal";
var [PortalProvider, usePortalContext] = createMenuContext(PORTAL_NAME$1, {
  forceMount: void 0
});
var MenuPortal = (props) => {
  const { __scopeMenu, forceMount, children, container } = props;
  const context = useMenuContext(PORTAL_NAME$1, __scopeMenu);
  return /* @__PURE__ */ jsx(PortalProvider, { scope: __scopeMenu, forceMount, children: /* @__PURE__ */ jsx(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsx(Portal$2, { asChild: true, container, children }) }) });
};
MenuPortal.displayName = PORTAL_NAME$1;
var CONTENT_NAME$1 = "MenuContent";
var [MenuContentProvider, useMenuContentContext] = createMenuContext(CONTENT_NAME$1);
var MenuContent = React.forwardRef(
  (props, forwardedRef) => {
    const portalContext = usePortalContext(CONTENT_NAME$1, props.__scopeMenu);
    const { forceMount = portalContext.forceMount, ...contentProps } = props;
    const context = useMenuContext(CONTENT_NAME$1, props.__scopeMenu);
    const rootContext = useMenuRootContext(CONTENT_NAME$1, props.__scopeMenu);
    return /* @__PURE__ */ jsx(Collection.Provider, { scope: props.__scopeMenu, children: /* @__PURE__ */ jsx(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsx(Collection.Slot, { scope: props.__scopeMenu, children: rootContext.modal ? /* @__PURE__ */ jsx(MenuRootContentModal, { ...contentProps, ref: forwardedRef }) : /* @__PURE__ */ jsx(MenuRootContentNonModal, { ...contentProps, ref: forwardedRef }) }) }) });
  }
);
var MenuRootContentModal = React.forwardRef(
  (props, forwardedRef) => {
    const context = useMenuContext(CONTENT_NAME$1, props.__scopeMenu);
    const ref = React.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref);
    React.useEffect(() => {
      const content = ref.current;
      if (content) return hideOthers(content);
    }, []);
    return /* @__PURE__ */ jsx(
      MenuContentImpl,
      {
        ...props,
        ref: composedRefs,
        trapFocus: context.open,
        disableOutsidePointerEvents: context.open,
        disableOutsideScroll: true,
        onFocusOutside: composeEventHandlers(
          props.onFocusOutside,
          (event) => event.preventDefault(),
          { checkForDefaultPrevented: false }
        ),
        onDismiss: () => context.onOpenChange(false)
      }
    );
  }
);
var MenuRootContentNonModal = React.forwardRef((props, forwardedRef) => {
  const context = useMenuContext(CONTENT_NAME$1, props.__scopeMenu);
  return /* @__PURE__ */ jsx(
    MenuContentImpl,
    {
      ...props,
      ref: forwardedRef,
      trapFocus: false,
      disableOutsidePointerEvents: false,
      disableOutsideScroll: false,
      onDismiss: () => context.onOpenChange(false)
    }
  );
});
var Slot = createSlot("MenuContent.ScrollLock");
var MenuContentImpl = React.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeMenu,
      loop = false,
      trapFocus,
      onOpenAutoFocus,
      onCloseAutoFocus,
      disableOutsidePointerEvents,
      onEntryFocus,
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside,
      onInteractOutside,
      onDismiss,
      disableOutsideScroll,
      ...contentProps
    } = props;
    const context = useMenuContext(CONTENT_NAME$1, __scopeMenu);
    const rootContext = useMenuRootContext(CONTENT_NAME$1, __scopeMenu);
    const popperScope = usePopperScope(__scopeMenu);
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeMenu);
    const getItems = useCollection(__scopeMenu);
    const [currentItemId, setCurrentItemId] = React.useState(null);
    const contentRef = React.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, contentRef, context.onContentChange);
    const timerRef = React.useRef(0);
    const searchRef = React.useRef("");
    const pointerGraceTimerRef = React.useRef(0);
    const pointerGraceIntentRef = React.useRef(null);
    const pointerDirRef = React.useRef("right");
    const lastPointerXRef = React.useRef(0);
    const ScrollLockWrapper = disableOutsideScroll ? RemoveScroll : React.Fragment;
    const scrollLockWrapperProps = disableOutsideScroll ? { as: Slot, allowPinchZoom: true } : void 0;
    const handleTypeaheadSearch = (key) => {
      const search = searchRef.current + key;
      const items = getItems().filter((item) => !item.disabled);
      const currentItem = document.activeElement;
      const currentMatch = items.find((item) => item.ref.current === currentItem)?.textValue;
      const values = items.map((item) => item.textValue);
      const nextMatch = getNextMatch(values, search, currentMatch);
      const newItem = items.find((item) => item.textValue === nextMatch)?.ref.current;
      (function updateSearch(value) {
        searchRef.current = value;
        window.clearTimeout(timerRef.current);
        if (value !== "") timerRef.current = window.setTimeout(() => updateSearch(""), 1e3);
      })(search);
      if (newItem) {
        setTimeout(() => newItem.focus());
      }
    };
    React.useEffect(() => {
      return () => window.clearTimeout(timerRef.current);
    }, []);
    useFocusGuards();
    const isPointerMovingToSubmenu = React.useCallback((event) => {
      const isMovingTowards = pointerDirRef.current === pointerGraceIntentRef.current?.side;
      return isMovingTowards && isPointerInGraceArea(event, pointerGraceIntentRef.current?.area);
    }, []);
    return /* @__PURE__ */ jsx(
      MenuContentProvider,
      {
        scope: __scopeMenu,
        searchRef,
        onItemEnter: React.useCallback(
          (event) => {
            if (isPointerMovingToSubmenu(event)) event.preventDefault();
          },
          [isPointerMovingToSubmenu]
        ),
        onItemLeave: React.useCallback(
          (event) => {
            if (isPointerMovingToSubmenu(event)) return;
            contentRef.current?.focus();
            setCurrentItemId(null);
          },
          [isPointerMovingToSubmenu]
        ),
        onTriggerLeave: React.useCallback(
          (event) => {
            if (isPointerMovingToSubmenu(event)) event.preventDefault();
          },
          [isPointerMovingToSubmenu]
        ),
        pointerGraceTimerRef,
        onPointerGraceIntentChange: React.useCallback((intent) => {
          pointerGraceIntentRef.current = intent;
        }, []),
        children: /* @__PURE__ */ jsx(ScrollLockWrapper, { ...scrollLockWrapperProps, children: /* @__PURE__ */ jsx(
          FocusScope,
          {
            asChild: true,
            trapped: trapFocus,
            onMountAutoFocus: composeEventHandlers(onOpenAutoFocus, (event) => {
              event.preventDefault();
              contentRef.current?.focus({ preventScroll: true });
            }),
            onUnmountAutoFocus: onCloseAutoFocus,
            children: /* @__PURE__ */ jsx(
              DismissableLayer,
              {
                asChild: true,
                disableOutsidePointerEvents,
                onEscapeKeyDown,
                onPointerDownOutside,
                onFocusOutside,
                onInteractOutside,
                onDismiss,
                children: /* @__PURE__ */ jsx(
                  Root,
                  {
                    asChild: true,
                    ...rovingFocusGroupScope,
                    dir: rootContext.dir,
                    orientation: "vertical",
                    loop,
                    currentTabStopId: currentItemId,
                    onCurrentTabStopIdChange: setCurrentItemId,
                    onEntryFocus: composeEventHandlers(onEntryFocus, (event) => {
                      if (!rootContext.isUsingKeyboardRef.current) event.preventDefault();
                    }),
                    preventScrollOnEntryFocus: true,
                    children: /* @__PURE__ */ jsx(
                      Content,
                      {
                        role: "menu",
                        "aria-orientation": "vertical",
                        "data-state": getOpenState(context.open),
                        "data-radix-menu-content": "",
                        dir: rootContext.dir,
                        ...popperScope,
                        ...contentProps,
                        ref: composedRefs,
                        style: { outline: "none", ...contentProps.style },
                        onKeyDown: composeEventHandlers(contentProps.onKeyDown, (event) => {
                          const target = event.target;
                          const isKeyDownInside = target.closest("[data-radix-menu-content]") === event.currentTarget;
                          const isModifierKey = event.ctrlKey || event.altKey || event.metaKey;
                          const isCharacterKey = event.key.length === 1;
                          if (isKeyDownInside) {
                            if (event.key === "Tab") event.preventDefault();
                            if (!isModifierKey && isCharacterKey) handleTypeaheadSearch(event.key);
                          }
                          const content = contentRef.current;
                          if (event.target !== content) return;
                          if (!FIRST_LAST_KEYS.includes(event.key)) return;
                          event.preventDefault();
                          const items = getItems().filter((item) => !item.disabled);
                          const candidateNodes = items.map((item) => item.ref.current);
                          if (LAST_KEYS.includes(event.key)) candidateNodes.reverse();
                          focusFirst(candidateNodes);
                        }),
                        onBlur: composeEventHandlers(props.onBlur, (event) => {
                          if (!event.currentTarget.contains(event.target)) {
                            window.clearTimeout(timerRef.current);
                            searchRef.current = "";
                          }
                        }),
                        onPointerMove: composeEventHandlers(
                          props.onPointerMove,
                          whenMouse((event) => {
                            const target = event.target;
                            const pointerXHasChanged = lastPointerXRef.current !== event.clientX;
                            if (event.currentTarget.contains(target) && pointerXHasChanged) {
                              const newDir = event.clientX > lastPointerXRef.current ? "right" : "left";
                              pointerDirRef.current = newDir;
                              lastPointerXRef.current = event.clientX;
                            }
                          })
                        )
                      }
                    )
                  }
                )
              }
            )
          }
        ) })
      }
    );
  }
);
MenuContent.displayName = CONTENT_NAME$1;
var GROUP_NAME$1 = "MenuGroup";
var MenuGroup = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeMenu, ...groupProps } = props;
    return /* @__PURE__ */ jsx(Primitive.div, { role: "group", ...groupProps, ref: forwardedRef });
  }
);
MenuGroup.displayName = GROUP_NAME$1;
var LABEL_NAME$1 = "MenuLabel";
var MenuLabel = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeMenu, ...labelProps } = props;
    return /* @__PURE__ */ jsx(Primitive.div, { ...labelProps, ref: forwardedRef });
  }
);
MenuLabel.displayName = LABEL_NAME$1;
var ITEM_NAME$1 = "MenuItem";
var ITEM_SELECT = "menu.itemSelect";
var MenuItem = React.forwardRef(
  (props, forwardedRef) => {
    const { disabled = false, onSelect, ...itemProps } = props;
    const ref = React.useRef(null);
    const rootContext = useMenuRootContext(ITEM_NAME$1, props.__scopeMenu);
    const contentContext = useMenuContentContext(ITEM_NAME$1, props.__scopeMenu);
    const composedRefs = useComposedRefs(forwardedRef, ref);
    const isPointerDownRef = React.useRef(false);
    const handleSelect = () => {
      const menuItem = ref.current;
      if (!disabled && menuItem) {
        const itemSelectEvent = new CustomEvent(ITEM_SELECT, { bubbles: true, cancelable: true });
        menuItem.addEventListener(ITEM_SELECT, (event) => onSelect?.(event), { once: true });
        dispatchDiscreteCustomEvent(menuItem, itemSelectEvent);
        if (itemSelectEvent.defaultPrevented) {
          isPointerDownRef.current = false;
        } else {
          rootContext.onClose();
        }
      }
    };
    return /* @__PURE__ */ jsx(
      MenuItemImpl,
      {
        ...itemProps,
        ref: composedRefs,
        disabled,
        onClick: composeEventHandlers(props.onClick, handleSelect),
        onPointerDown: (event) => {
          props.onPointerDown?.(event);
          isPointerDownRef.current = true;
        },
        onPointerUp: composeEventHandlers(props.onPointerUp, (event) => {
          if (!isPointerDownRef.current) event.currentTarget?.click();
        }),
        onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
          const isTypingAhead = contentContext.searchRef.current !== "";
          if (disabled || isTypingAhead && event.key === " ") return;
          if (SELECTION_KEYS.includes(event.key)) {
            event.currentTarget.click();
            event.preventDefault();
          }
        })
      }
    );
  }
);
MenuItem.displayName = ITEM_NAME$1;
var MenuItemImpl = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeMenu, disabled = false, textValue, ...itemProps } = props;
    const contentContext = useMenuContentContext(ITEM_NAME$1, __scopeMenu);
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeMenu);
    const ref = React.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref);
    const [isFocused, setIsFocused] = React.useState(false);
    const [textContent, setTextContent] = React.useState("");
    React.useEffect(() => {
      const menuItem = ref.current;
      if (menuItem) {
        setTextContent((menuItem.textContent ?? "").trim());
      }
    }, [itemProps.children]);
    return /* @__PURE__ */ jsx(
      Collection.ItemSlot,
      {
        scope: __scopeMenu,
        disabled,
        textValue: textValue ?? textContent,
        children: /* @__PURE__ */ jsx(Item, { asChild: true, ...rovingFocusGroupScope, focusable: !disabled, children: /* @__PURE__ */ jsx(
          Primitive.div,
          {
            role: "menuitem",
            "data-highlighted": isFocused ? "" : void 0,
            "aria-disabled": disabled || void 0,
            "data-disabled": disabled ? "" : void 0,
            ...itemProps,
            ref: composedRefs,
            onPointerMove: composeEventHandlers(
              props.onPointerMove,
              whenMouse((event) => {
                if (disabled) {
                  contentContext.onItemLeave(event);
                } else {
                  contentContext.onItemEnter(event);
                  if (!event.defaultPrevented) {
                    const item = event.currentTarget;
                    item.focus({ preventScroll: true });
                  }
                }
              })
            ),
            onPointerLeave: composeEventHandlers(
              props.onPointerLeave,
              whenMouse((event) => contentContext.onItemLeave(event))
            ),
            onFocus: composeEventHandlers(props.onFocus, () => setIsFocused(true)),
            onBlur: composeEventHandlers(props.onBlur, () => setIsFocused(false))
          }
        ) })
      }
    );
  }
);
var CHECKBOX_ITEM_NAME$1 = "MenuCheckboxItem";
var MenuCheckboxItem = React.forwardRef(
  (props, forwardedRef) => {
    const { checked = false, onCheckedChange, ...checkboxItemProps } = props;
    return /* @__PURE__ */ jsx(ItemIndicatorProvider, { scope: props.__scopeMenu, checked, children: /* @__PURE__ */ jsx(
      MenuItem,
      {
        role: "menuitemcheckbox",
        "aria-checked": isIndeterminate(checked) ? "mixed" : checked,
        ...checkboxItemProps,
        ref: forwardedRef,
        "data-state": getCheckedState(checked),
        onSelect: composeEventHandlers(
          checkboxItemProps.onSelect,
          () => onCheckedChange?.(isIndeterminate(checked) ? true : !checked),
          { checkForDefaultPrevented: false }
        )
      }
    ) });
  }
);
MenuCheckboxItem.displayName = CHECKBOX_ITEM_NAME$1;
var RADIO_GROUP_NAME$1 = "MenuRadioGroup";
var [RadioGroupProvider, useRadioGroupContext] = createMenuContext(
  RADIO_GROUP_NAME$1,
  { value: void 0, onValueChange: () => {
  } }
);
var MenuRadioGroup = React.forwardRef(
  (props, forwardedRef) => {
    const { value, onValueChange, ...groupProps } = props;
    const handleValueChange = useCallbackRef(onValueChange);
    return /* @__PURE__ */ jsx(RadioGroupProvider, { scope: props.__scopeMenu, value, onValueChange: handleValueChange, children: /* @__PURE__ */ jsx(MenuGroup, { ...groupProps, ref: forwardedRef }) });
  }
);
MenuRadioGroup.displayName = RADIO_GROUP_NAME$1;
var RADIO_ITEM_NAME$1 = "MenuRadioItem";
var MenuRadioItem = React.forwardRef(
  (props, forwardedRef) => {
    const { value, ...radioItemProps } = props;
    const context = useRadioGroupContext(RADIO_ITEM_NAME$1, props.__scopeMenu);
    const checked = value === context.value;
    return /* @__PURE__ */ jsx(ItemIndicatorProvider, { scope: props.__scopeMenu, checked, children: /* @__PURE__ */ jsx(
      MenuItem,
      {
        role: "menuitemradio",
        "aria-checked": checked,
        ...radioItemProps,
        ref: forwardedRef,
        "data-state": getCheckedState(checked),
        onSelect: composeEventHandlers(
          radioItemProps.onSelect,
          () => context.onValueChange?.(value),
          { checkForDefaultPrevented: false }
        )
      }
    ) });
  }
);
MenuRadioItem.displayName = RADIO_ITEM_NAME$1;
var ITEM_INDICATOR_NAME = "MenuItemIndicator";
var [ItemIndicatorProvider, useItemIndicatorContext] = createMenuContext(
  ITEM_INDICATOR_NAME,
  { checked: false }
);
var MenuItemIndicator = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeMenu, forceMount, ...itemIndicatorProps } = props;
    const indicatorContext = useItemIndicatorContext(ITEM_INDICATOR_NAME, __scopeMenu);
    return /* @__PURE__ */ jsx(
      Presence,
      {
        present: forceMount || isIndeterminate(indicatorContext.checked) || indicatorContext.checked === true,
        children: /* @__PURE__ */ jsx(
          Primitive.span,
          {
            ...itemIndicatorProps,
            ref: forwardedRef,
            "data-state": getCheckedState(indicatorContext.checked)
          }
        )
      }
    );
  }
);
MenuItemIndicator.displayName = ITEM_INDICATOR_NAME;
var SEPARATOR_NAME$1 = "MenuSeparator";
var MenuSeparator = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeMenu, ...separatorProps } = props;
    return /* @__PURE__ */ jsx(
      Primitive.div,
      {
        role: "separator",
        "aria-orientation": "horizontal",
        ...separatorProps,
        ref: forwardedRef
      }
    );
  }
);
MenuSeparator.displayName = SEPARATOR_NAME$1;
var ARROW_NAME$1 = "MenuArrow";
var MenuArrow = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeMenu, ...arrowProps } = props;
    const popperScope = usePopperScope(__scopeMenu);
    return /* @__PURE__ */ jsx(Arrow, { ...popperScope, ...arrowProps, ref: forwardedRef });
  }
);
MenuArrow.displayName = ARROW_NAME$1;
var SUB_NAME = "MenuSub";
var [MenuSubProvider, useMenuSubContext] = createMenuContext(SUB_NAME);
var SUB_TRIGGER_NAME$1 = "MenuSubTrigger";
var MenuSubTrigger = React.forwardRef(
  (props, forwardedRef) => {
    const context = useMenuContext(SUB_TRIGGER_NAME$1, props.__scopeMenu);
    const rootContext = useMenuRootContext(SUB_TRIGGER_NAME$1, props.__scopeMenu);
    const subContext = useMenuSubContext(SUB_TRIGGER_NAME$1, props.__scopeMenu);
    const contentContext = useMenuContentContext(SUB_TRIGGER_NAME$1, props.__scopeMenu);
    const openTimerRef = React.useRef(null);
    const { pointerGraceTimerRef, onPointerGraceIntentChange } = contentContext;
    const scope = { __scopeMenu: props.__scopeMenu };
    const clearOpenTimer = React.useCallback(() => {
      if (openTimerRef.current) window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }, []);
    React.useEffect(() => clearOpenTimer, [clearOpenTimer]);
    React.useEffect(() => {
      const pointerGraceTimer = pointerGraceTimerRef.current;
      return () => {
        window.clearTimeout(pointerGraceTimer);
        onPointerGraceIntentChange(null);
      };
    }, [pointerGraceTimerRef, onPointerGraceIntentChange]);
    return /* @__PURE__ */ jsx(MenuAnchor, { asChild: true, ...scope, children: /* @__PURE__ */ jsx(
      MenuItemImpl,
      {
        id: subContext.triggerId,
        "aria-haspopup": "menu",
        "aria-expanded": context.open,
        "aria-controls": subContext.contentId,
        "data-state": getOpenState(context.open),
        ...props,
        ref: composeRefs(forwardedRef, subContext.onTriggerChange),
        onClick: (event) => {
          props.onClick?.(event);
          if (props.disabled || event.defaultPrevented) return;
          event.currentTarget.focus();
          if (!context.open) context.onOpenChange(true);
        },
        onPointerMove: composeEventHandlers(
          props.onPointerMove,
          whenMouse((event) => {
            contentContext.onItemEnter(event);
            if (event.defaultPrevented) return;
            if (!props.disabled && !context.open && !openTimerRef.current) {
              contentContext.onPointerGraceIntentChange(null);
              openTimerRef.current = window.setTimeout(() => {
                context.onOpenChange(true);
                clearOpenTimer();
              }, 100);
            }
          })
        ),
        onPointerLeave: composeEventHandlers(
          props.onPointerLeave,
          whenMouse((event) => {
            clearOpenTimer();
            const contentRect = context.content?.getBoundingClientRect();
            if (contentRect) {
              const side = context.content?.dataset.side;
              const rightSide = side === "right";
              const bleed = rightSide ? -5 : 5;
              const contentNearEdge = contentRect[rightSide ? "left" : "right"];
              const contentFarEdge = contentRect[rightSide ? "right" : "left"];
              contentContext.onPointerGraceIntentChange({
                area: [
                  // Apply a bleed on clientX to ensure that our exit point is
                  // consistently within polygon bounds
                  { x: event.clientX + bleed, y: event.clientY },
                  { x: contentNearEdge, y: contentRect.top },
                  { x: contentFarEdge, y: contentRect.top },
                  { x: contentFarEdge, y: contentRect.bottom },
                  { x: contentNearEdge, y: contentRect.bottom }
                ],
                side
              });
              window.clearTimeout(pointerGraceTimerRef.current);
              pointerGraceTimerRef.current = window.setTimeout(
                () => contentContext.onPointerGraceIntentChange(null),
                300
              );
            } else {
              contentContext.onTriggerLeave(event);
              if (event.defaultPrevented) return;
              contentContext.onPointerGraceIntentChange(null);
            }
          })
        ),
        onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
          const isTypingAhead = contentContext.searchRef.current !== "";
          if (props.disabled || isTypingAhead && event.key === " ") return;
          if (SUB_OPEN_KEYS[rootContext.dir].includes(event.key)) {
            context.onOpenChange(true);
            context.content?.focus();
            event.preventDefault();
          }
        })
      }
    ) });
  }
);
MenuSubTrigger.displayName = SUB_TRIGGER_NAME$1;
var SUB_CONTENT_NAME$1 = "MenuSubContent";
var MenuSubContent = React.forwardRef(
  (props, forwardedRef) => {
    const portalContext = usePortalContext(CONTENT_NAME$1, props.__scopeMenu);
    const { forceMount = portalContext.forceMount, ...subContentProps } = props;
    const context = useMenuContext(CONTENT_NAME$1, props.__scopeMenu);
    const rootContext = useMenuRootContext(CONTENT_NAME$1, props.__scopeMenu);
    const subContext = useMenuSubContext(SUB_CONTENT_NAME$1, props.__scopeMenu);
    const ref = React.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref);
    return /* @__PURE__ */ jsx(Collection.Provider, { scope: props.__scopeMenu, children: /* @__PURE__ */ jsx(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsx(Collection.Slot, { scope: props.__scopeMenu, children: /* @__PURE__ */ jsx(
      MenuContentImpl,
      {
        id: subContext.contentId,
        "aria-labelledby": subContext.triggerId,
        ...subContentProps,
        ref: composedRefs,
        align: "start",
        side: rootContext.dir === "rtl" ? "left" : "right",
        disableOutsidePointerEvents: false,
        disableOutsideScroll: false,
        trapFocus: false,
        onOpenAutoFocus: (event) => {
          if (rootContext.isUsingKeyboardRef.current) ref.current?.focus();
          event.preventDefault();
        },
        onCloseAutoFocus: (event) => event.preventDefault(),
        onFocusOutside: composeEventHandlers(props.onFocusOutside, (event) => {
          if (event.target !== subContext.trigger) context.onOpenChange(false);
        }),
        onEscapeKeyDown: composeEventHandlers(props.onEscapeKeyDown, (event) => {
          rootContext.onClose();
          event.preventDefault();
        }),
        onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
          const isKeyDownInside = event.currentTarget.contains(event.target);
          const isCloseKey = SUB_CLOSE_KEYS[rootContext.dir].includes(event.key);
          if (isKeyDownInside && isCloseKey) {
            context.onOpenChange(false);
            subContext.trigger?.focus();
            event.preventDefault();
          }
        })
      }
    ) }) }) });
  }
);
MenuSubContent.displayName = SUB_CONTENT_NAME$1;
function getOpenState(open) {
  return open ? "open" : "closed";
}
function isIndeterminate(checked) {
  return checked === "indeterminate";
}
function getCheckedState(checked) {
  return isIndeterminate(checked) ? "indeterminate" : checked ? "checked" : "unchecked";
}
function focusFirst(candidates) {
  const PREVIOUSLY_FOCUSED_ELEMENT = document.activeElement;
  for (const candidate of candidates) {
    if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) return;
    candidate.focus();
    if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT) return;
  }
}
function wrapArray(array, startIndex) {
  return array.map((_, index) => array[(startIndex + index) % array.length]);
}
function getNextMatch(values, search, currentMatch) {
  const isRepeated = search.length > 1 && Array.from(search).every((char) => char === search[0]);
  const normalizedSearch = isRepeated ? search[0] : search;
  const currentMatchIndex = currentMatch ? values.indexOf(currentMatch) : -1;
  let wrappedValues = wrapArray(values, Math.max(currentMatchIndex, 0));
  const excludeCurrentMatch = normalizedSearch.length === 1;
  if (excludeCurrentMatch) wrappedValues = wrappedValues.filter((v) => v !== currentMatch);
  const nextMatch = wrappedValues.find(
    (value) => value.toLowerCase().startsWith(normalizedSearch.toLowerCase())
  );
  return nextMatch !== currentMatch ? nextMatch : void 0;
}
function isPointInPolygon(point, polygon) {
  const { x, y } = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const ii = polygon[i];
    const jj = polygon[j];
    const xi = ii.x;
    const yi = ii.y;
    const xj = jj.x;
    const yj = jj.y;
    const intersect = yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
function isPointerInGraceArea(event, area) {
  if (!area) return false;
  const cursorPos = { x: event.clientX, y: event.clientY };
  return isPointInPolygon(cursorPos, area);
}
function whenMouse(handler) {
  return (event) => event.pointerType === "mouse" ? handler(event) : void 0;
}
var Root3 = Menu;
var Anchor2 = MenuAnchor;
var Portal = MenuPortal;
var Content2$1 = MenuContent;
var Group = MenuGroup;
var Label = MenuLabel;
var Item2$1 = MenuItem;
var CheckboxItem = MenuCheckboxItem;
var RadioGroup = MenuRadioGroup;
var RadioItem = MenuRadioItem;
var ItemIndicator = MenuItemIndicator;
var Separator = MenuSeparator;
var Arrow2 = MenuArrow;
var SubTrigger = MenuSubTrigger;
var SubContent = MenuSubContent;

var DROPDOWN_MENU_NAME = "DropdownMenu";
var [createDropdownMenuContext] = createContextScope(
  DROPDOWN_MENU_NAME,
  [createMenuScope]
);
var useMenuScope = createMenuScope();
var [DropdownMenuProvider, useDropdownMenuContext] = createDropdownMenuContext(DROPDOWN_MENU_NAME);
var DropdownMenu$1 = (props) => {
  const {
    __scopeDropdownMenu,
    children,
    dir,
    open: openProp,
    defaultOpen,
    onOpenChange,
    modal = true
  } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  const triggerRef = React.useRef(null);
  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
    caller: DROPDOWN_MENU_NAME
  });
  return /* @__PURE__ */ jsx(
    DropdownMenuProvider,
    {
      scope: __scopeDropdownMenu,
      triggerId: useId(),
      triggerRef,
      contentId: useId(),
      open,
      onOpenChange: setOpen,
      onOpenToggle: React.useCallback(() => setOpen((prevOpen) => !prevOpen), [setOpen]),
      modal,
      children: /* @__PURE__ */ jsx(Root3, { ...menuScope, open, onOpenChange: setOpen, dir, modal, children })
    }
  );
};
DropdownMenu$1.displayName = DROPDOWN_MENU_NAME;
var TRIGGER_NAME = "DropdownMenuTrigger";
var DropdownMenuTrigger$1 = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDropdownMenu, disabled = false, ...triggerProps } = props;
    const context = useDropdownMenuContext(TRIGGER_NAME, __scopeDropdownMenu);
    const menuScope = useMenuScope(__scopeDropdownMenu);
    return /* @__PURE__ */ jsx(Anchor2, { asChild: true, ...menuScope, children: /* @__PURE__ */ jsx(
      Primitive.button,
      {
        type: "button",
        id: context.triggerId,
        "aria-haspopup": "menu",
        "aria-expanded": context.open,
        "aria-controls": context.open ? context.contentId : void 0,
        "data-state": context.open ? "open" : "closed",
        "data-disabled": disabled ? "" : void 0,
        disabled,
        ...triggerProps,
        ref: composeRefs(forwardedRef, context.triggerRef),
        onPointerDown: composeEventHandlers(props.onPointerDown, (event) => {
          if (!disabled && event.button === 0 && event.ctrlKey === false) {
            context.onOpenToggle();
            if (!context.open) event.preventDefault();
          }
        }),
        onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
          if (disabled) return;
          if (["Enter", " "].includes(event.key)) context.onOpenToggle();
          if (event.key === "ArrowDown") context.onOpenChange(true);
          if (["Enter", " ", "ArrowDown"].includes(event.key)) event.preventDefault();
        })
      }
    ) });
  }
);
DropdownMenuTrigger$1.displayName = TRIGGER_NAME;
var PORTAL_NAME = "DropdownMenuPortal";
var DropdownMenuPortal = (props) => {
  const { __scopeDropdownMenu, ...portalProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return /* @__PURE__ */ jsx(Portal, { ...menuScope, ...portalProps });
};
DropdownMenuPortal.displayName = PORTAL_NAME;
var CONTENT_NAME = "DropdownMenuContent";
var DropdownMenuContent$1 = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDropdownMenu, ...contentProps } = props;
    const context = useDropdownMenuContext(CONTENT_NAME, __scopeDropdownMenu);
    const menuScope = useMenuScope(__scopeDropdownMenu);
    const hasInteractedOutsideRef = React.useRef(false);
    return /* @__PURE__ */ jsx(
      Content2$1,
      {
        id: context.contentId,
        "aria-labelledby": context.triggerId,
        ...menuScope,
        ...contentProps,
        ref: forwardedRef,
        onCloseAutoFocus: composeEventHandlers(props.onCloseAutoFocus, (event) => {
          if (!hasInteractedOutsideRef.current) context.triggerRef.current?.focus();
          hasInteractedOutsideRef.current = false;
          event.preventDefault();
        }),
        onInteractOutside: composeEventHandlers(props.onInteractOutside, (event) => {
          const originalEvent = event.detail.originalEvent;
          const ctrlLeftClick = originalEvent.button === 0 && originalEvent.ctrlKey === true;
          const isRightClick = originalEvent.button === 2 || ctrlLeftClick;
          if (!context.modal || isRightClick) hasInteractedOutsideRef.current = true;
        }),
        style: {
          ...props.style,
          // re-namespace exposed content custom properties
          ...{
            "--radix-dropdown-menu-content-transform-origin": "var(--radix-popper-transform-origin)",
            "--radix-dropdown-menu-content-available-width": "var(--radix-popper-available-width)",
            "--radix-dropdown-menu-content-available-height": "var(--radix-popper-available-height)",
            "--radix-dropdown-menu-trigger-width": "var(--radix-popper-anchor-width)",
            "--radix-dropdown-menu-trigger-height": "var(--radix-popper-anchor-height)"
          }
        }
      }
    );
  }
);
DropdownMenuContent$1.displayName = CONTENT_NAME;
var GROUP_NAME = "DropdownMenuGroup";
var DropdownMenuGroup = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDropdownMenu, ...groupProps } = props;
    const menuScope = useMenuScope(__scopeDropdownMenu);
    return /* @__PURE__ */ jsx(Group, { ...menuScope, ...groupProps, ref: forwardedRef });
  }
);
DropdownMenuGroup.displayName = GROUP_NAME;
var LABEL_NAME = "DropdownMenuLabel";
var DropdownMenuLabel$1 = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDropdownMenu, ...labelProps } = props;
    const menuScope = useMenuScope(__scopeDropdownMenu);
    return /* @__PURE__ */ jsx(Label, { ...menuScope, ...labelProps, ref: forwardedRef });
  }
);
DropdownMenuLabel$1.displayName = LABEL_NAME;
var ITEM_NAME = "DropdownMenuItem";
var DropdownMenuItem$1 = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDropdownMenu, ...itemProps } = props;
    const menuScope = useMenuScope(__scopeDropdownMenu);
    return /* @__PURE__ */ jsx(Item2$1, { ...menuScope, ...itemProps, ref: forwardedRef });
  }
);
DropdownMenuItem$1.displayName = ITEM_NAME;
var CHECKBOX_ITEM_NAME = "DropdownMenuCheckboxItem";
var DropdownMenuCheckboxItem$1 = React.forwardRef((props, forwardedRef) => {
  const { __scopeDropdownMenu, ...checkboxItemProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return /* @__PURE__ */ jsx(CheckboxItem, { ...menuScope, ...checkboxItemProps, ref: forwardedRef });
});
DropdownMenuCheckboxItem$1.displayName = CHECKBOX_ITEM_NAME;
var RADIO_GROUP_NAME = "DropdownMenuRadioGroup";
var DropdownMenuRadioGroup = React.forwardRef((props, forwardedRef) => {
  const { __scopeDropdownMenu, ...radioGroupProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return /* @__PURE__ */ jsx(RadioGroup, { ...menuScope, ...radioGroupProps, ref: forwardedRef });
});
DropdownMenuRadioGroup.displayName = RADIO_GROUP_NAME;
var RADIO_ITEM_NAME = "DropdownMenuRadioItem";
var DropdownMenuRadioItem$1 = React.forwardRef((props, forwardedRef) => {
  const { __scopeDropdownMenu, ...radioItemProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return /* @__PURE__ */ jsx(RadioItem, { ...menuScope, ...radioItemProps, ref: forwardedRef });
});
DropdownMenuRadioItem$1.displayName = RADIO_ITEM_NAME;
var INDICATOR_NAME = "DropdownMenuItemIndicator";
var DropdownMenuItemIndicator = React.forwardRef((props, forwardedRef) => {
  const { __scopeDropdownMenu, ...itemIndicatorProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return /* @__PURE__ */ jsx(ItemIndicator, { ...menuScope, ...itemIndicatorProps, ref: forwardedRef });
});
DropdownMenuItemIndicator.displayName = INDICATOR_NAME;
var SEPARATOR_NAME = "DropdownMenuSeparator";
var DropdownMenuSeparator$1 = React.forwardRef((props, forwardedRef) => {
  const { __scopeDropdownMenu, ...separatorProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return /* @__PURE__ */ jsx(Separator, { ...menuScope, ...separatorProps, ref: forwardedRef });
});
DropdownMenuSeparator$1.displayName = SEPARATOR_NAME;
var ARROW_NAME = "DropdownMenuArrow";
var DropdownMenuArrow = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDropdownMenu, ...arrowProps } = props;
    const menuScope = useMenuScope(__scopeDropdownMenu);
    return /* @__PURE__ */ jsx(Arrow2, { ...menuScope, ...arrowProps, ref: forwardedRef });
  }
);
DropdownMenuArrow.displayName = ARROW_NAME;
var SUB_TRIGGER_NAME = "DropdownMenuSubTrigger";
var DropdownMenuSubTrigger$1 = React.forwardRef((props, forwardedRef) => {
  const { __scopeDropdownMenu, ...subTriggerProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return /* @__PURE__ */ jsx(SubTrigger, { ...menuScope, ...subTriggerProps, ref: forwardedRef });
});
DropdownMenuSubTrigger$1.displayName = SUB_TRIGGER_NAME;
var SUB_CONTENT_NAME = "DropdownMenuSubContent";
var DropdownMenuSubContent$1 = React.forwardRef((props, forwardedRef) => {
  const { __scopeDropdownMenu, ...subContentProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return /* @__PURE__ */ jsx(
    SubContent,
    {
      ...menuScope,
      ...subContentProps,
      ref: forwardedRef,
      style: {
        ...props.style,
        // re-namespace exposed content custom properties
        ...{
          "--radix-dropdown-menu-content-transform-origin": "var(--radix-popper-transform-origin)",
          "--radix-dropdown-menu-content-available-width": "var(--radix-popper-available-width)",
          "--radix-dropdown-menu-content-available-height": "var(--radix-popper-available-height)",
          "--radix-dropdown-menu-trigger-width": "var(--radix-popper-anchor-width)",
          "--radix-dropdown-menu-trigger-height": "var(--radix-popper-anchor-height)"
        }
      }
    }
  );
});
DropdownMenuSubContent$1.displayName = SUB_CONTENT_NAME;
var Root2 = DropdownMenu$1;
var Trigger = DropdownMenuTrigger$1;
var Portal2 = DropdownMenuPortal;
var Content2 = DropdownMenuContent$1;
var Label2 = DropdownMenuLabel$1;
var Item2 = DropdownMenuItem$1;
var CheckboxItem2 = DropdownMenuCheckboxItem$1;
var RadioItem2 = DropdownMenuRadioItem$1;
var ItemIndicator2 = DropdownMenuItemIndicator;
var Separator2 = DropdownMenuSeparator$1;
var SubTrigger2 = DropdownMenuSubTrigger$1;
var SubContent2 = DropdownMenuSubContent$1;

const DropdownMenu = Root2;
const DropdownMenuTrigger = Trigger;
const DropdownMenuSubTrigger = React.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SubTrigger2,
  {
    ref,
    className: cn(
      "flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(ChevronRight, { className: "ml-auto" })
    ]
  }
));
DropdownMenuSubTrigger.displayName = SubTrigger2.displayName;
const DropdownMenuSubContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SubContent2,
  {
    ref,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
));
DropdownMenuSubContent.displayName = SubContent2.displayName;
const DropdownMenuContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(Portal2, { children: /* @__PURE__ */ jsx(
  Content2,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
) }));
DropdownMenuContent.displayName = Content2.displayName;
const DropdownMenuItem = React.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx(
  Item2,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
DropdownMenuItem.displayName = Item2.displayName;
const DropdownMenuCheckboxItem = React.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ jsxs(
  CheckboxItem2,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    checked,
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(ItemIndicator2, { children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) }) }),
      children
    ]
  }
));
DropdownMenuCheckboxItem.displayName = CheckboxItem2.displayName;
const DropdownMenuRadioItem = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  RadioItem2,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(ItemIndicator2, { children: /* @__PURE__ */ jsx(Circle, { className: "h-2 w-2 fill-current" }) }) }),
      children
    ]
  }
));
DropdownMenuRadioItem.displayName = RadioItem2.displayName;
const DropdownMenuLabel = React.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx(
  Label2,
  {
    ref,
    className: cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
DropdownMenuLabel.displayName = Label2.displayName;
const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  Separator2,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
DropdownMenuSeparator.displayName = Separator2.displayName;

const navItems = [
  { href: "/", icon: Home, label: "文件" },
  { href: "/chat", icon: MessageCircle, label: "对话" },
  { href: "/search", icon: Search, label: "搜索" },
  { href: "/tags", icon: Tag, label: "标签" }
];
const moreMenuItems = [
  { href: "/analyze", icon: Sparkles, label: "分析" },
  { href: "/quarterly", icon: FileEdit, label: "解析" },
  { href: "/users", icon: Users, label: "用户" }
];
function MobileBottomNav() {
  const [pathname, setPathname] = useState("/");
  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (error) {
      console.error("登出失败:", error);
    }
  };
  return /* @__PURE__ */ jsx("nav", { className: "fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t md:hidden z-50 safe-area-pb", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-around h-16", children: [
    navItems.map((item) => {
      const Icon = item.icon;
      const isActive = pathname === item.href;
      return /* @__PURE__ */ jsxs(
        "a",
        {
          href: item.href,
          className: cn(
            "flex flex-col items-center justify-center w-full h-full min-h-[44px] transition-colors relative no-tap-highlight",
            isActive ? "text-primary" : "text-muted-foreground"
          ),
          children: [
            isActive && /* @__PURE__ */ jsx("span", { className: "absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-b-full" }),
            /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5 mb-1", strokeWidth: isActive ? 2.5 : 2 }),
            /* @__PURE__ */ jsx("span", { className: "text-xs font-medium", children: item.label })
          ]
        },
        item.href
      );
    }),
    /* @__PURE__ */ jsxs(DropdownMenu, { children: [
      /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs("button", { className: "flex flex-col items-center justify-center w-full h-full min-h-[44px] text-muted-foreground transition-colors", children: [
        /* @__PURE__ */ jsx(Menu$1, { className: "h-5 w-5 mb-1" }),
        /* @__PURE__ */ jsx("span", { className: "text-xs font-medium", children: "更多" })
      ] }) }),
      /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", className: "min-w-[150px]", children: [
        moreMenuItems.map((item) => {
          const Icon = item.icon;
          return /* @__PURE__ */ jsx(DropdownMenuItem, { asChild: true, children: /* @__PURE__ */ jsxs("a", { href: item.href, className: "cursor-pointer", children: [
            /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 mr-2" }),
            /* @__PURE__ */ jsx("span", { children: item.label })
          ] }) }, item.href);
        }),
        /* @__PURE__ */ jsx(DropdownMenuItem, { asChild: true, children: /* @__PURE__ */ jsxs("a", { href: "/ai/config", className: "cursor-pointer", children: [
          /* @__PURE__ */ jsx(Settings, { className: "h-4 w-4 mr-2" }),
          /* @__PURE__ */ jsx("span", { children: "AI 配置" })
        ] }) }),
        /* @__PURE__ */ jsxs(
          DropdownMenuItem,
          {
            className: "text-destructive focus:text-destructive cursor-pointer",
            onClick: handleLogout,
            children: [
              /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4 mr-2" }),
              /* @__PURE__ */ jsx("span", { children: "登出" })
            ]
          }
        )
      ] })
    ] })
  ] }) });
}

function Dashboard({ initialFolders = [], initialFiles = [] }) {
  const [folders, setFolders] = useState(initialFolders);
  const [files, setFiles] = useState(initialFiles);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();
  const loadFolders = async () => {
    try {
      const response = await fetch("/api/folders");
      const data = await response.json();
      setFolders(data.folders || []);
    } catch (error) {
      console.error("加载文件夹失败:", error);
    }
  };
  const loadFiles = async (folderId = null) => {
    try {
      setIsLoading(true);
      const url = folderId ? `/api/files?folderId=${folderId}` : "/api/files?folderId=null";
      const response = await fetch(url);
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error("加载文件失败:", error);
      toast({
        title: "加载失败",
        description: "无法加载文件列表",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    loadFolders();
    const lastSelectedFolderId = sessionStorage.getItem("lastSelectedFolderId");
    if (lastSelectedFolderId) {
      setSelectedFolderId(lastSelectedFolderId);
      sessionStorage.removeItem("lastSelectedFolderId");
    }
    loadFiles(lastSelectedFolderId);
  }, []);
  useEffect(() => {
    loadFiles(selectedFolderId);
  }, [selectedFolderId]);
  const handleCreateFolder = async () => {
    const name = prompt("请输入文件夹名称:");
    if (!name) return;
    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, parentId: selectedFolderId })
      });
      if (response.ok) {
        toast({
          title: "创建成功",
          description: `文件夹 "${name}" 已创建`
        });
        loadFolders();
      } else {
        throw new Error("创建失败");
      }
    } catch (error) {
      toast({
        title: "创建失败",
        description: "无法创建文件夹",
        variant: "destructive"
      });
    }
  };
  const handleFolderDelete = async (folderId) => {
    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: "DELETE"
      });
      if (response.ok) {
        toast({
          title: "删除成功",
          description: "文件夹已删除"
        });
        if (selectedFolderId === folderId) {
          setSelectedFolderId(null);
        }
        loadFolders();
      } else {
        throw new Error("删除失败");
      }
    } catch (error) {
      toast({
        title: "删除失败",
        description: "无法删除文件夹",
        variant: "destructive"
      });
    }
  };
  const handleFileDelete = async (fileId) => {
    if (!confirm("确定要删除这个文件吗？")) return;
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: "DELETE"
      });
      if (response.ok) {
        toast({
          title: "删除成功",
          description: "文件已删除"
        });
        loadFiles(selectedFolderId);
      } else {
        throw new Error("删除失败");
      }
    } catch (error) {
      toast({
        title: "删除失败",
        description: "无法删除文件",
        variant: "destructive"
      });
    }
  };
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  const handleFileUpload = useCallback(async (file) => {
    console.log("[Upload] 开始上传文件", { name: file.name, size: file.size, type: file.type });
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadServerUrl = undefined                                  || "http://localhost:3001";
      console.log("[Upload] 步骤1: 上传到服务器", { url: uploadServerUrl });
      const uploadResponse = await fetch(`${uploadServerUrl}/upload`, {
        method: "POST",
        body: formData
      });
      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json();
        throw new Error(`服务器上传失败: ${uploadError.error || uploadResponse.statusText}`);
      }
      const uploadResult = await uploadResponse.json();
      console.log("[Upload] 服务器上传成功", { uploadResult });
      console.log("[Upload] 步骤2: 保存元数据");
      const metaResponse = await fetch("/api/save-file-meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          folderId: selectedFolderId,
          serverFilename: uploadResult.data.filename,
          serverUrl: uploadResult.data.url,
          size: uploadResult.data.size,
          mimeType: uploadResult.data.mimetype
        })
      });
      if (!metaResponse.ok) {
        const metaError = await metaResponse.json();
        throw new Error(`元数据保存失败: ${metaError.error || metaResponse.statusText}`);
      }
      const metaResult = await metaResponse.json();
      console.log("[Upload] 元数据保存成功", { metaResult });
      toast({
        title: "上传成功",
        description: `${file.name} 已上传`
      });
    } catch (error) {
      console.error("[Upload] 上传异常", { error, fileName: file.name });
      toast({
        title: "上传失败",
        description: `${file.name} 上传失败: ${error instanceof Error ? error.message : "未知错误"}`,
        variant: "destructive"
      });
    }
  }, [selectedFolderId, toast]);
  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files2 = Array.from(e.dataTransfer.files);
    console.log("[Upload] handleDrop 开始", { filesCount: files2.length, selectedFolderId });
    const supportedFiles = files2.filter(
      (f) => f.type === "application/pdf" || f.type.includes("excel") || f.type.includes("spreadsheet")
    );
    console.log("[Upload] 过滤后的文件", { total: files2.length, supportedFiles: supportedFiles.length });
    if (supportedFiles.length === 0) {
      console.warn("[Upload] 没有支持的文件");
      toast({
        title: "文件类型错误",
        description: "只支持PDF和Excel文件",
        variant: "destructive"
      });
      return;
    }
    for (const file of supportedFiles) {
      await handleFileUpload(file);
    }
    loadFiles(selectedFolderId);
  }, [selectedFolderId, toast, handleFileUpload, loadFiles]);
  useCallback(async (e) => {
    const files2 = e.target.files;
    console.log("[Upload] handleFileSelect 开始", { filesCount: files2?.length, selectedFolderId });
    if (!files2 || files2.length === 0) return;
    const supportedFiles = Array.from(files2).filter(
      (f) => f.type === "application/pdf" || f.type.includes("excel") || f.type.includes("spreadsheet")
    );
    console.log("[Upload] 过滤后的文件", { total: files2.length, supportedFiles: supportedFiles.length });
    if (supportedFiles.length === 0) {
      console.warn("[Upload] 没有支持的文件");
      toast({
        title: "文件类型错误",
        description: "只支持PDF和Excel文件",
        variant: "destructive"
      });
      return;
    }
    for (const file of supportedFiles) {
      await handleFileUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    loadFiles(selectedFolderId);
  }, [selectedFolderId, toast, handleFileUpload, loadFiles]);
  const folderTree = buildTree(folders);
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx(
      "aside",
      {
        className: `
          fixed inset-y-0 left-0 z-50
          w-64
          bg-card border-r transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:flex-shrink-0
        `,
        children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 md:p-4 border-b", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Folder, { className: "h-5 w-5 text-blue-500" }),
              /* @__PURE__ */ jsx("h2", { className: "font-semibold text-base md:text-lg", children: "投后文档" })
            ] }),
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "lg:hidden",
                onClick: () => setSidebarOpen(false),
                children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto p-2", children: /* @__PURE__ */ jsx(
            FileTree,
            {
              folders: folderTree,
              selectedFolderId,
              onFolderSelect: setSelectedFolderId,
              onFolderDelete: handleFolderDelete
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "border-t p-3 space-y-2 bg-muted/30", children: [
            /* @__PURE__ */ jsxs(
              Button,
              {
                variant: "outline",
                size: "sm",
                className: "w-full justify-start min-h-[44px]",
                onClick: handleCreateFolder,
                children: [
                  /* @__PURE__ */ jsx(Folder, { className: "h-4 w-4 mr-2" }),
                  "新建文件夹"
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              FileUpload,
              {
                folderId: selectedFolderId,
                onUploadComplete: () => loadFiles(selectedFolderId),
                compact: true
              }
            )
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxs("main", { className: "flex-1 w-full min-w-0 pb-16 md:pb-0", children: [
      /* @__PURE__ */ jsx("header", { className: "bg-card border-b px-4 md:px-6 py-3 md:py-4", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 md:gap-4", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            size: "icon",
            className: "lg:hidden min-h-[44px] min-w-[44px]",
            onClick: () => setSidebarOpen(true),
            children: /* @__PURE__ */ jsx(Menu$1, { className: "h-5 w-5" })
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-lg md:text-xl font-semibold", children: selectedFolderId ? String(folders.find((f) => f.id === selectedFolderId)?.name ?? "未知文件夹") : "星界母基金" }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs md:text-sm text-muted-foreground", children: [
            files.length,
            " 个文件"
          ] })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "p-4 md:p-6 flex-1",
          onDragOver: handleDragOver,
          onDragLeave: handleDragLeave,
          onDrop: handleDrop,
          children: isLoading ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
            /* @__PURE__ */ jsx(FileText, { className: "h-12 w-12 mx-auto mb-4 text-muted-foreground" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "加载中..." })
          ] }) : files.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
            /* @__PURE__ */ jsx(FileText, { className: "h-12 w-12 mx-auto mb-4 text-muted-foreground" }),
            /* @__PURE__ */ jsx("p", { className: "text-lg font-medium text-muted-foreground mb-2", children: "暂无文件" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-6", children: "点击左侧「上传文件」按钮开始使用" }),
            /* @__PURE__ */ jsx(
              FileUpload,
              {
                folderId: selectedFolderId,
                onUploadComplete: () => loadFiles(selectedFolderId)
              }
            )
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            isDragging && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-primary/10 z-50 flex items-center justify-center pointer-events-none", children: /* @__PURE__ */ jsxs("div", { className: "bg-background border-2 border-primary border-dashed rounded-lg p-8 md:p-12 mx-4", children: [
              /* @__PURE__ */ jsx(Upload, { className: "h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-primary" }),
              /* @__PURE__ */ jsx("p", { className: "text-base md:text-lg font-medium text-center", children: "松手以上传文件" })
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4", children: files.map((file) => /* @__PURE__ */ jsx(
              FileCard,
              {
                file,
                onDelete: handleFileDelete,
                onProcessed: () => loadFiles(selectedFolderId)
              },
              file.id
            )) })
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ jsx(MobileBottomNav, {}),
    sidebarOpen && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 bg-black/50 z-40 lg:hidden",
        onClick: () => setSidebarOpen(false)
      }
    )
  ] });
}

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const initialFolders = await db.select().from(folders);
  const initialFiles = await db.select().from(files).where(isNull(files.folderId));
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "\u6295\u540E\u6587\u6863\u7BA1\u7406" }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "Dashboard", Dashboard, { "initialFolders": initialFolders, "initialFiles": initialFiles, "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/hu/dropbox/claudeworking/postinvestment-astro/src/components/islands/Dashboard", "client:component-export": "default" })} ` })}`;
}, "/Users/hu/dropbox/claudeworking/postinvestment-astro/src/pages/index.astro", void 0);

const $$file = "/Users/hu/dropbox/claudeworking/postinvestment-astro/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
