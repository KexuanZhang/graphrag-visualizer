import React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Drawer,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DataTable from "./DataTable";
import {
  CustomLink,
  CustomNode,
  customLinkColumns,
  customNodeColumns,
} from "../models/custom-graph-data";
import { textUnitColumns } from "../models/text-unit";
import { communityColumns } from "../models/community";
// Import the Finding type and findingColumns
import {
  communityReportColumns,
  findingColumns,
  Finding,
} from "../models/community-report";
import { documentColumns } from "../models/document";
import { covariateColumns } from "../models/covariate";
import { MRT_ColumnDef } from "material-react-table";
import { entityColumns } from "../models/entity";

interface DetailDrawerProps {
  bottomDrawerOpen: boolean;
  setBottomDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedNode: CustomNode | null;
  selectedRelationship: CustomLink | null;
  linkedNodes: CustomNode[];
  linkedRelationships: CustomLink[];
}

const DetailDrawer: React.FC<DetailDrawerProps> = ({
  bottomDrawerOpen,
  setBottomDrawerOpen,
  selectedNode,
  selectedRelationship,
  linkedNodes,
  linkedRelationships,
}) => {
  const getNodeName = (node: string | CustomNode) => {
    return typeof node === "object" ? node.name : node;
  };

  const getNodeType = (node: string | CustomNode) => {
    return typeof node === "object" ? node.type : node;
  };

  const getFilteredNodeColumns = (
    types: string[]
  ): MRT_ColumnDef<CustomNode>[] => {
    const validAccessorKeys = new Set<string>();
    if (types.includes("CHUNK")) {
      textUnitColumns.forEach((tc) => {
        if (tc.accessorKey) {
          validAccessorKeys.add(tc.accessorKey);
        }
      });
    }

    if (types.includes("COMMUNITY")) {
      communityColumns.forEach((tc) => {
        if (tc.accessorKey) {
          validAccessorKeys.add(tc.accessorKey);
        }
      });
      communityReportColumns.forEach((tc) => {
        if (tc.accessorKey) {
          validAccessorKeys.add(tc.accessorKey);
        }
      });
    }

    if (types.includes("RAW_DOCUMENT")) {
      documentColumns.forEach((tc) => {
        if (tc.accessorKey) {
          validAccessorKeys.add(tc.accessorKey);
        }
      });
    }

    if (types.includes("COVARIATE")) {
      covariateColumns.forEach((tc) => {
        if (tc.accessorKey) {
          validAccessorKeys.add(tc.accessorKey);
        }
      });
    }

    if (types.includes("FINDING")) {
      // Include findingColumns here so that filteredColumns includes finding properties,
      // though we'll render findings in a separate table with its own columns.
      findingColumns.forEach((tc) => {
        if (tc.accessorKey) {
          validAccessorKeys.add(tc.accessorKey);
        }
      });
    }

    entityColumns.forEach((tc) => {
      if (tc.accessorKey) {
        validAccessorKeys.add(tc.accessorKey);
      }
    });

    validAccessorKeys.add("uuid");
    return customNodeColumns.filter(
      (column) =>
        column.accessorKey && validAccessorKeys.has(column.accessorKey)
    );
  };

  // Determine which types appear in linkedNodes
  const linkedNodeTypes = [
    ...new Set(linkedNodes.map((node) => node.type)),
  ];

  // Filter columns based on all linked node types (including FINDING)
  const filteredColumns = getFilteredNodeColumns(linkedNodeTypes);

  // Separate out findings from other linked nodes
  const linkedFindings = linkedNodes.filter(
    (node) => node.type === "FINDING"
  ) as Finding[];
  const otherLinkedNodes = linkedNodes.filter(
    (node) => node.type !== "FINDING"
  );

  // Filter out the "id" column from findingColumns
  const findingColumnsNoId: MRT_ColumnDef<Finding>[] = findingColumns.filter(
    (col) => col.accessorKey !== "id"
  );

  return (
    <Drawer
      anchor="bottom"
      open={bottomDrawerOpen}
      onClose={() => setBottomDrawerOpen(false)}
      sx={{ zIndex: 1500 }}
    >
      <Box sx={{ width: "100%", padding: 3 }}>
        {/* Header: Node or Relationship */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 2,
          }}
        >
          {selectedNode ? (
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Node Details: {selectedNode.name.toString()}
            </Typography>
          ) : (
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {selectedRelationship && (
                <>
                  {getNodeName(selectedRelationship.source)}
                  {" — "}
                  <strong>{selectedRelationship.type}</strong>
                  {" — "}
                  {getNodeName(selectedRelationship.target)}
                </>
              )}
            </Typography>
          )}
          <IconButton
            onClick={() => setBottomDrawerOpen(false)}
            sx={{ marginLeft: "auto" }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Selected Node Info Card */}
        {selectedNode && (
          <Card sx={{ marginBottom: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Node Information
              </Typography>
              <Typography>Title: {selectedNode.name}</Typography>
              <Typography>
                Type: <Chip label={selectedNode.type} size="small" />
              </Typography>
              {selectedNode.title && (
                <Typography>
                  Community Report Title: {selectedNode.title}
                </Typography>
              )}
              {selectedNode.summary && (
                <Typography>Summary: {selectedNode.summary}</Typography>
              )}
              {selectedNode.n_tokens && (
                <Typography>
                  Number of Tokens: {selectedNode.n_tokens}
                </Typography>
              )}
              {selectedNode.description && (
                <Typography>
                  Description: {selectedNode.description}
                </Typography>
              )}
            </CardContent>
          </Card>
        )}

        {/* Selected Relationship Info Card */}
        {selectedRelationship && (
          <Card sx={{ marginBottom: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Relationship Information:
              </Typography>
              <Typography>
                Source: {getNodeName(selectedRelationship.source)}
              </Typography>
              <Typography>
                Target: {getNodeName(selectedRelationship.target)}
              </Typography>
              <Typography>Type: {selectedRelationship.type}</Typography>
              {selectedRelationship.description && (
                <Typography>
                  Description: {selectedRelationship.description}
                </Typography>
              )}
              {selectedRelationship.weight && (
                <Typography>Weight: {selectedRelationship.weight}</Typography>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Linked Findings (without the "id" column) */}
        {linkedFindings.length > 0 && (
          <Box sx={{ marginBottom: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              Linked Findings
            </Typography>
            <DataTable<Finding>
              data={linkedFindings}
              columns={findingColumnsNoId}
            />
          </Box>
        )}

        {/* Linked Nodes (excluding Findings) */}
        {otherLinkedNodes.length > 0 && (
          <Box sx={{ marginBottom: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              Linked Nodes
            </Typography>
            <DataTable columns={filteredColumns} data={otherLinkedNodes} />
          </Box>
        )}

        

        {/* Linked Relationships (only if a node is selected) */}
        {selectedNode && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              Linked Relationships
            </Typography>
            <DataTable
              columns={customLinkColumns}
              data={linkedRelationships.map((link) => ({
                ...link,
                source: getNodeName(link.source),
                target: getNodeName(link.target),
              }))}
            />
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default DetailDrawer;
