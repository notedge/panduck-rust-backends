use notedown_ast::{
    nodes::{CodeNode, Delimiter, Header, ListView, Literal, MathNode, StyleKind, StyleNode, TableView, TextSpan},
    ASTKind,
};
use sycamore::generic_node::GenericNode;

use crate::{
    builder::{SycamoreBuilder, SycamoreConfig, SycamoreContext},
    shared::{error_inline, push_nodes},
};

mod blocks;
mod command;
mod link;
mod list;
mod table;
mod text;

pub trait IntoSycamore<G: GenericNode> {
    fn into_sycamore(self, cfg: &SycamoreConfig, ctx: &mut SycamoreContext) -> G;
}

impl<T, G> IntoSycamore<G> for Literal<T>
where
    T: IntoSycamore<G>,
    G: GenericNode,
{
    fn into_sycamore(self, cfg: &SycamoreConfig, ctx: &mut SycamoreContext) -> G {
        self.value.into_sycamore(cfg, ctx)
    }
}

impl<G> IntoSycamore<G> for ASTKind
where
    G: GenericNode,
{
    fn into_sycamore(self, cfg: &SycamoreConfig, ctx: &mut SycamoreContext) -> G {
        match self {
            Self::Statements(children) => {
                let root: G = GenericNode::element_from_tag("div");
                root.set_class_name("notedown");
                push_nodes(&root, children, cfg, ctx);
                return root;
            }
            Self::Paragraph(children) => {
                let p = GenericNode::element_from_tag("p");
                push_nodes(&p, children, cfg, ctx);
                return p;
            }
            Self::Header(inner) => inner.into_sycamore(cfg, ctx),
            Self::Delimiter(inner) => inner.into_sycamore(cfg, ctx),
            Self::TableView(inner) => inner.into_sycamore(cfg, ctx),
            Self::ListView(inner) => inner.into_sycamore(cfg, ctx),
            Self::QuoteNode(inner) => inner.into_sycamore(cfg, ctx),
            Self::CodeNode(inner) => inner.into_sycamore(cfg, ctx),
            Self::MathNode(inner) => inner.into_sycamore(cfg, ctx),
            Self::LinkNode(inner) => inner.into_sycamore(cfg, ctx),
            Self::TextSpan(inner) => inner.into_sycamore(cfg, ctx),
            Self::StyledSpan(inner) => inner.into_sycamore(cfg, ctx),
            Self::Command(inner) => inner.into_sycamore(cfg, ctx),
            Self::Value(inner) => inner.into_sycamore(cfg, ctx),
        }
    }
}
