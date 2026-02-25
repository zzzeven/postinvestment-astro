import { e as createComponent, k as renderComponent, r as renderTemplate } from '../chunks/astro/server_BuDLk9JT.mjs';
import 'piccolore';
import { c as createSlot, a as cn, u as useToast, C as Card, b as CardHeader, d as CardTitle, e as CardDescription, f as CardContent, I as Input, B as Button, $ as $$Layout } from '../chunks/use-toast_D1TYwyzs.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import * as React from 'react';
import { useState } from 'react';
import { Lock, User } from 'lucide-react';
import 'react-dom';
import { cva } from 'class-variance-authority';
export { renderers } from '../renderers.mjs';

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
  const Slot = createSlot(`Primitive.${node}`);
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

var NAME = "Label";
var Label$1 = React.forwardRef((props, forwardedRef) => {
  return /* @__PURE__ */ jsx(
    Primitive.label,
    {
      ...props,
      ref: forwardedRef,
      onMouseDown: (event) => {
        const target = event.target;
        if (target.closest("button, input, select, textarea")) return;
        props.onMouseDown?.(event);
        if (!event.defaultPrevented && event.detail > 1) event.preventDefault();
      }
    }
  );
});
Label$1.displayName = NAME;
var Root = Label$1;

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);
const Label = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  Root,
  {
    ref,
    className: cn(labelVariants(), className),
    ...props
  }
));
Label.displayName = Root.displayName;

function LoginForm({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        title: "错误",
        description: "请输入用户名和密码",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok) {
        toast({
          title: "登录成功",
          description: `欢迎回来，${data.user.username}`
        });
        window.location.href = "/";
      } else {
        throw new Error(data.error || "登录失败");
      }
    } catch (error) {
      toast({
        title: "登录失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxs(CardHeader, { className: "space-y-1 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-4", children: /* @__PURE__ */ jsx("div", { className: "p-3 bg-primary/10 rounded-full", children: /* @__PURE__ */ jsx(Lock, { className: "h-8 w-8 text-primary" }) }) }),
      /* @__PURE__ */ jsx(CardTitle, { className: "text-2xl", children: "投后文档管理系统" }),
      /* @__PURE__ */ jsx(CardDescription, { children: "请登录以继续" })
    ] }),
    /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { onSubmit: handleLogin, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "username", children: "用户名" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(User, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "username",
              type: "text",
              value: username,
              onChange: (e) => setUsername(e.target.value),
              placeholder: "请输入用户名",
              className: "pl-9",
              disabled: isLoading
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "密码" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "password",
              type: "password",
              value: password,
              onChange: (e) => setPassword(e.target.value),
              placeholder: "请输入密码",
              className: "pl-9",
              disabled: isLoading
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, children: isLoading ? "登录中..." : "登录" })
    ] }) })
  ] }) });
}

const $$Login = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "\u767B\u5F55" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "LoginForm", LoginForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/hu/dropbox/claudeworking/postinvestment-astro/src/components/islands/LoginForm", "client:component-export": "default" })} ` })}`;
}, "/Users/hu/dropbox/claudeworking/postinvestment-astro/src/pages/login.astro", void 0);

const $$file = "/Users/hu/dropbox/claudeworking/postinvestment-astro/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
